"""Encode the two independent, natively rendered camera projections."""
import pathlib,subprocess,json,shutil
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parents[2];OUT=ROOT/'.preview'/'store-v9'
def run(args):subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y',*args],check=True)
output=['-c:v','libx264','-preset','slow','-crf','19','-g','6','-keyint_min','6','-sc_threshold','0','-pix_fmt','yuv420p','-movflags','+faststart','-threads','4']
report={}
for name,prefix,filename,poster in [
    ('desktop','delivery','aira-store-v9.mp4','store-poster-v9.jpg'),
    ('mobile','mobile','aira-store-mobile-v9.mp4','store-poster-mobile-v9.jpg')]:
    frames=OUT/(prefix+'-frames')
    for i in range(84):
        with Image.open(frames/f'{i:04d}.png') as im:im.verify()
    dest=ROOT/'public'/'video'/filename
    run(['-framerate','12','-i',str(frames/'%04d.png'),'-vf','fps=24',*output,'-maxrate','7200k' if name=='desktop' else '2200k','-bufsize','14400k' if name=='desktop' else '4400k',str(dest)])
    with Image.open(frames/'0000.png') as im:im.convert('RGB').save(ROOT/'public'/'images'/poster,quality=92,optimize=True)
    report[name]=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height,r_frame_rate,nb_frames,codec_name,pix_fmt:format=duration,size','-of','json',str(dest)],text=True))
    print(name,'encoded',flush=True)
shutil.copy2(OUT/'aira-store-v9-delivery.blend',ROOT/'artwork'/'aira-store-v9.blend')
(OUT/'delivery-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
reports=ROOT/'artwork'/'reports';reports.mkdir(parents=True,exist_ok=True)
shutil.copy2(OUT/'delivery-report.json',reports/'store-v9-delivery.json')
print(json.dumps(report,indent=2),flush=True)
