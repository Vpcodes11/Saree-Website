import sys,pathlib,time,os,argparse
sys.path.insert(0,r'C:\Users\Trade\.codex\tmp\aira-blender\runtime')
import bpy
ROOT=pathlib.Path(__file__).resolve().parents[2];OUT=ROOT/'.preview'/'store-v8'
p=argparse.ArgumentParser();p.add_argument('--proof',action='store_true');p.add_argument('--mobile',action='store_true');p.add_argument('--samples',type=int,default=20);p.add_argument('--width',type=int,default=1440);args=p.parse_args()
bpy.ops.wm.open_mainfile(filepath=str(OUT/'aira-store-v8.blend'));s=bpy.context.scene
s.render.engine='BLENDER_EEVEE_NEXT';s.eevee.taa_render_samples=args.samples
s.render.resolution_x=args.width;s.render.resolution_y=round(args.width*9/16);s.render.resolution_percentage=100
if args.mobile:
    s.render.resolution_x=540;s.render.resolution_y=960;s.camera.data.sensor_fit='VERTICAL';s.camera.data.sensor_height=32;s.camera.data.lens=22
variant='mobile' if args.mobile else 'delivery'
s.frame_set(0)
if not args.mobile:bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'aira-store-v8-delivery.blend'))
dest=OUT/(variant+('-proof' if args.proof else '-frames'));dest.mkdir(exist_ok=True)
frames=[0,96,167] if args.proof else list(range(0,168,2))
with (OUT/(variant+('-proof-progress.txt' if args.proof else '-progress.txt'))).open('w') as progress:
    for index,frame in enumerate(frames):
        if not args.proof and (dest/f'{index:04d}.png').exists():
            from PIL import Image
            try:
                with Image.open(dest/f'{index:04d}.png') as existing: existing.verify()
                progress.write(f'{index+1}/{len(frames)} retained; camera frame {frame}\n');progress.flush();continue
            except Exception:pass
        s.frame_set(frame);s.render.filepath=str(dest/f'{index:04d}.png');start=time.time()
        with (OUT/(variant+'-engine.log')).open('a') as log:
            stdout=os.dup(1);stderr=os.dup(2)
            try:os.dup2(log.fileno(),1);os.dup2(log.fileno(),2);bpy.ops.render.render(write_still=True)
            finally:os.dup2(stdout,1);os.dup2(stderr,2);os.close(stdout);os.close(stderr)
        message=f'{index+1}/{len(frames)} rendered; camera frame {frame}; {time.time()-start:.1f}s';progress.write(message+'\n');progress.flush();print(message,flush=True)
print('V8 FRAMES COMPLETE',flush=True)

