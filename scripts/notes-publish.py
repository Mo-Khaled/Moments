"""Publish the Notes page through the Shopify CLI (store execute). DRY RUN by default; --apply writes.
Needs the CLI store auth to include ONLY: write_online_store_pages, write_metaobjects, write_metaobject_definitions (same family), write_files.
Steps: 1 ensure the `note` definition has the text fields + image + online-store URLs (/pages/notes/<handle>), 2 upload the 37 1024px WebPs to Files,
3 upsert the 37 entries (ACTIVE) with the owner's texts from notes_content.json (copied as is), 4 create the page /pages/notes (template notes).
Never touches products, customers or orders (the top_products product-reference field is skipped on purpose).
usage: python scripts/notes-publish.py [--apply]"""
import json, os, shutil, subprocess, sys, time, urllib.request

APPLY = '--apply' in sys.argv
STORE = 'dezrva-2z.myshopify.com'
SH = shutil.which('shopify') or shutil.which('shopify.cmd')
SRC = r'D:/MOMENTS_Content/06_Website/notes'
WEB = SRC + '/images/web'
TEXT = ['family_en', 'family_ar', 'longevity_en', 'longevity_ar', 'simple_en', 'simple_ar', 'source_en', 'source_ar', 'story_en', 'story_ar', 'pairs']


def gql(q, variables=None, mutate=False):
    cmd = [SH, 'store', 'execute', '--store', STORE, '--no-input', '--json', '--query', q]
    if variables:
        cmd += ['--variables', json.dumps(variables)]
    if mutate:
        cmd.append('--allow-mutations')
    for attempt in range(8):
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
        j = r.stdout.find(chr(123) + chr(10))
        if j >= 0:
            return json.loads(r.stdout[j:])
        time.sleep(5 * (attempt + 1))  # sign-in check or rate limit failed: wait and retry
    raise SystemExit('CLI error: ' + (r.stderr or r.stdout)[-600:])


def multiline(k):
    return k.startswith(('simple', 'source', 'story', 'longevity'))


def main():
    notes = json.load(open(SRC + '/notes_content.json', encoding='utf-8'))['notes']
    # only notes that have no entry yet (the first 37 were published on 2026-11-20; never re-upload their pictures)
    have_h, after = set(), None
    while True:
        q = '{ metaobjects(type:"note", first:250%s){ pageInfo{hasNextPage endCursor} nodes{ handle } } }' % (', after:"%s"' % after if after else '')
        r = gql(q)['metaobjects']
        have_h |= {n['handle'] for n in r['nodes']}
        if not r['pageInfo']['hasNextPage']:
            break
        after = r['pageInfo']['endCursor']
    notes = [n for n in notes if n['handle'] not in have_h]
    print('existing entries:', len(have_h), '| to publish:', len(notes))
    d = gql('{ metaobjectDefinitionByType(type:"note"){ id capabilities{ onlineStore{enabled} } fieldDefinitions{ key type{name} } } }')
    mdef = d.get('metaobjectDefinitionByType')
    if not mdef:
        raise SystemExit('cannot read the note definition: the CLI auth is missing a scope (read/write_metaobject_definitions)')
    have = {f['key']: f['type']['name'] for f in mdef['fieldDefinitions']}
    missing = [(k, 'multi_line_text_field' if multiline(k) else 'single_line_text_field') for k in TEXT if k not in have]
    if 'image' not in have:
        missing.append(('image', 'file_reference'))
    online = (mdef['capabilities'].get('onlineStore') or {}).get('enabled')
    print('definition fields:', have, '\nmissing:', missing, '| online store pages enabled:', online)
    if not APPLY:
        print('DRY RUN: would add the missing fields, enable URLs /pages/notes/<handle>, upload', len(notes), 'images, upsert', len(notes), 'entries ACTIVE, create page /pages/notes')
        return
    upd = {'fieldDefinitions': [{'create': {'key': k, 'name': k.replace('_', ' ').title(), 'type': t}} for k, t in missing]}
    if not online:
        upd['capabilities'] = {'onlineStore': {'enabled': True, 'data': {'urlHandle': 'notes'}}}
    r = gql('mutation($id:ID!,$d:MetaobjectDefinitionUpdateInput!){ metaobjectDefinitionUpdate(id:$id, definition:$d){ userErrors{message code} } }', {'id': mdef['id'], 'd': upd}, True)
    print('definition update:', r['metaobjectDefinitionUpdate']['userErrors'])
    file_ids = {}
    for n in notes:
        path = f"{WEB}/note-{n['handle']}-1024.webp"
        size = os.path.getsize(path)
        s = gql('mutation($i:[StagedUploadInput!]!){ stagedUploadsCreate(input:$i){ stagedTargets{ url resourceUrl parameters{name value} } userErrors{message} } }',
                {'i': [{'filename': os.path.basename(path), 'mimeType': 'image/webp', 'httpMethod': 'POST', 'resource': 'IMAGE', 'fileSize': str(size)}]}, True)
        t = s['stagedUploadsCreate']['stagedTargets'][0]
        boundary = '----m' + str(time.time_ns())
        body = b''
        for p in t['parameters']:
            body += f'--{boundary}\r\nContent-Disposition: form-data; name="{p["name"]}"\r\n\r\n{p["value"]}\r\n'.encode()
        body += f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{os.path.basename(path)}"\r\nContent-Type: image/webp\r\n\r\n'.encode() + open(path, 'rb').read() + f'\r\n--{boundary}--\r\n'.encode()
        urllib.request.urlopen(urllib.request.Request(t['url'], data=body, headers={'Content-Type': 'multipart/form-data; boundary=' + boundary}), timeout=300).read()
        f = gql('mutation($f:[FileCreateInput!]!){ fileCreate(files:$f){ files{ id } userErrors{message} } }',
                {'f': [{'originalSource': t['resourceUrl'], 'contentType': 'IMAGE', 'alt': n['name_en'] + ' (fragrance note)'}]}, True)
        file_ids[n['handle']] = f['fileCreate']['files'][0]['id']
        print('file', n['handle'], file_ids[n['handle']])
    for n in notes:
        fields = [{'key': 'name', 'value': n['name_en']}, {'key': 'name_ar', 'value': n['name_ar']}, {'key': 'image', 'value': file_ids[n['handle']]}]
        for k in TEXT:
            v = n.get(k)
            if v:
                fields.append({'key': k, 'value': ', '.join(v) if isinstance(v, list) else v})
        r = gql('mutation($h:MetaobjectHandleInput!,$m:MetaobjectUpsertInput!){ metaobjectUpsert(handle:$h, metaobject:$m){ metaobject{ handle } userErrors{message} } }',
                {'h': {'type': 'note', 'handle': n['handle']}, 'm': {'capabilities': {'publishable': {'status': 'ACTIVE'}}, 'fields': fields}}, True)
        print('entry', n['handle'], r['metaobjectUpsert']['userErrors'])
    if gql('{ pages(first:1, query:"handle:notes"){ nodes{ id } } }')['pages']['nodes']:
        print('page /pages/notes exists: not created again')
        return
    r = gql('mutation($p:PageCreateInput!){ pageCreate(page:$p){ page{ id handle } userErrors{message} } }',
            {'p': {'title': 'Notes', 'handle': 'notes', 'templateSuffix': 'notes', 'isPublished': True, 'body': ''}}, True)
    print('page:', r['pageCreate'])


main()
