import zipfile
import xml.etree.ElementTree as ET
import json

z = zipfile.ZipFile(r'c:\Users\SAKSHAM\Downloads\Futbol Store\public\temp_docx.zip')
xml_content = z.read('word/document.xml')
root = ET.fromstring(xml_content)
ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'a': 'http://schemas.openxmlformats.org/drawingml/2006/main', 'pic': 'http://schemas.openxmlformats.org/drawingml/2006/picture', 'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}

rels_content = z.read('word/_rels/document.xml.rels')
rels_root = ET.fromstring(rels_content)
rel_ns = {'rel': 'http://schemas.openxmlformats.org/package/2006/relationships'}
rel_map = {r.attrib['Id']: r.attrib['Target'] for r in rels_root.findall('rel:Relationship', rel_ns)}

items = []
for p in root.findall('.//w:p', ns):
    p_text = ''
    has_image = None
    for child in p.iter():
        if child.tag == '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t' and child.text:
            p_text += child.text
        elif child.tag == '{http://schemas.openxmlformats.org/drawingml/2006/picture}blipFill':
            blip = child.find('a:blip', ns)
            if blip is not None:
                has_image = rel_map.get(blip.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed'))
    if p_text.strip():
        items.append({'type': 'text', 'value': p_text.strip()})
    if has_image:
        items.append({'type': 'image', 'value': has_image})

with open('extracted.json', 'w', encoding='utf-8') as f:
    json.dump(items, f, indent=2, ensure_ascii=False)
