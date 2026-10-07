import pathlib,json,subprocess,hashlib
from PIL import Image
import sys
import os
if os.environ.get('AIRA_BLENDER_PYTHONPATH'): sys.path.insert(0, os.environ['AIRA_BLENDER_PYTHONPATH'])
import bpy
ROOT=pathlib.Path(__file__).resolve().parents[2];OUT=ROOT/'.preview'/'store-v9';PROOF=OUT/'encoded-proof';PROOF.mkdir(exist_ok=True)
scene=json.loads((OUT/'scene-report.json').read_text(encoding='utf-8'))
assert scene['human_or_image_planes']==0
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'artwork'/'aira-store-v9.blend'))
assets=[i for i in bpy.data.images if i.source in ('FILE','MOVIE','SEQUENCE')]
expected=hashlib.sha256((ROOT/'public/textures/showroom/zari-paisley.png').read_bytes()).hexdigest()
assert len(assets)==1 and assets[0].packed_file and hashlib.sha256(bytes(assets[0].packed_file.data)).hexdigest()==expected,'Only the packed, authored zari mask is allowed'
photo_assets=[i.name for i in assets if i.name!='zari-paisley.png']
photo_nodes=[m.name for m in bpy.data.materials if m.use_nodes and any(n.type=='TEX_IMAGE' and (not n.image or n.image.name!='zari-paisley.png') for n in m.node_tree.nodes)]
human_objects=[o.name for o in bpy.data.objects if any(word in o.name.lower() for word in ('mannequin','portrait','fashion model','campaign model','photographic'))]
assert not photo_assets and not photo_nodes and not human_objects,(photo_assets,photo_nodes,human_objects)
scene['photographic_images']=photo_assets;scene['authored_pattern_textures']=[i.name for i in assets];scene.pop('images',None);scene['photo_texture_materials']=photo_nodes;scene['human_objects']=human_objects
(OUT/'scene-report.json').write_text(json.dumps(scene,indent=2),encoding='utf-8')
report={'no_humans_or_image_planes':True,'native_views_per_variant':84,'variants':{}}
for label,file in [('desktop','aira-store-v9.mp4'),('mobile','aira-store-mobile-v9.mp4')]:
    src=ROOT/'public'/'video'/file
    data=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_entries','frame=key_frame,best_effort_timestamp_time','-of','json',str(src)],text=True))
    frames=data['frames'];assert len(frames)==168
    keys=[float(f['best_effort_timestamp_time']) for f in frames if f['key_frame']==1]
    gaps=[b-a for a,b in zip(keys,keys[1:])];assert max(gaps)<=.251
    payload=src.read_bytes();assert 0<payload.find(b'moov')<payload.find(b'mdat')
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(src),'-f','null','-'],check=True)
    for i,t in enumerate([0,3.5,6.917]):
        dest=PROOF/f'{label}-{i}.png'
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss',str(t),'-i',str(src),'-frames:v','1',str(dest)],check=True)
        with Image.open(dest) as im:im.verify()
    report['variants'][label]={'frames':len(frames),'max_keyframe_gap_seconds':max(gaps),'fast_start':True,'decode':'passed'}
(OUT/'verification-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
reports=ROOT/'artwork'/'reports';reports.mkdir(parents=True,exist_ok=True)
import shutil
shutil.copy2(OUT/'scene-report.json',reports/'store-v9-scene.json')
shutil.copy2(OUT/'verification-report.json',reports/'store-v9-verification.json')
print(json.dumps(report,indent=2),flush=True)
