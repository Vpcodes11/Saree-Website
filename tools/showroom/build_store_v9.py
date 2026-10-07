"""AIRA's new textile palace. Geometry and materials only: no image planes or people."""
import sys, pathlib, math, random, json
import os
if os.environ.get('AIRA_BLENDER_PYTHONPATH'): sys.path.insert(0, os.environ['AIRA_BLENDER_PYTHONPATH'])
import bpy
from mathutils import Vector
ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT/'.preview'/'store-v9'; OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
s = bpy.context.scene
random.seed(41)

def rgb(h):
    c=[int(h[i:i+2],16)/255 for i in (1,3,5)]
    return tuple(v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in c)+(1,)
def mat(name, color, rough=.4, metal=0, emission=0):
    m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value=rgb(color);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
    if emission:p.inputs['Emission Color'].default_value=rgb(color);p.inputs['Emission Strength'].default_value=emission
    return m
def texture(m, colors, scale=(1,1,1), detail=3, strength=.08, distance=.005):
    n=m.node_tree.nodes;l=m.node_tree.links;p=n['Principled BSDF'];tc=n.new('ShaderNodeTexCoord')
    mapping=n.new('ShaderNodeVectorMath');mapping.operation='MULTIPLY';mapping.inputs[1].default_value=scale;l.new(tc.outputs['Object'],mapping.inputs[0])
    noise=n.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=1;noise.inputs['Detail'].default_value=detail;noise.inputs['Roughness'].default_value=.68;l.new(mapping.outputs[0],noise.inputs['Vector'])
    ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.25;ramp.color_ramp.elements[0].color=rgb(colors[0]);ramp.color_ramp.elements[1].position=.75;ramp.color_ramp.elements[1].color=rgb(colors[1]);l.new(noise.outputs['Fac'],ramp.inputs[0]);l.new(ramp.outputs[0],p.inputs['Base Color'])
    bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=strength;bump.inputs['Distance'].default_value=distance;l.new(noise.outputs['Fac'],bump.inputs['Height']);l.new(bump.outputs[0],p.inputs['Normal'])
    return m
def mesh(name,verts,faces,m):
    d=bpy.data.meshes.new(name);d.from_pydata(verts,[],faces);d.materials.append(m);d.update()
    o=bpy.data.objects.new(name,d);s.collection.objects.link(o);return o
def cube(name,loc,size,m,bevel=.014):
    o=mesh(name,[(x*size[0]/2,y*size[1]/2,z*size[2]/2) for x,y,z in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]],[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],m);o.location=loc
    if bevel:
        mod=o.modifiers.new('Hand-finished edges','BEVEL');mod.width=bevel;mod.segments=3;o.modifiers.new('Corner normals','WEIGHTED_NORMAL')
    return o
def curve(name,points,r,m,closed=False):
    d=bpy.data.curves.new(name,'CURVE');d.dimensions='3D';d.resolution_u=2;d.bevel_depth=r;d.bevel_resolution=3
    sp=d.splines.new('POLY');sp.points.add(len(points)-1)
    for p,co in zip(sp.points,points):p.co=(*co,1)
    sp.use_cyclic_u=closed;d.materials.append(m);o=bpy.data.objects.new(name,d);s.collection.objects.link(o);return o
def ellipse(name,loc,rx,ry,r,m):
    return curve(name,[(loc[0]+rx*math.cos(a*math.tau/128),loc[1]+ry*math.sin(a*math.tau/128),loc[2]) for a in range(128)],r,m,True)
def cylinder(name,loc,r,height,m,n=40):
    verts=[(loc[0]+r*math.cos(i*math.tau/n),loc[1]+r*math.sin(i*math.tau/n),loc[2]+z*height/2) for z in [-1,1] for i in range(n)]
    faces=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    o=mesh(name,verts,faces,m)
    for p in o.data.polygons:p.use_smooth=len(p.vertices)==4
    bevel=o.modifiers.new('Turned edge','BEVEL');bevel.width=.006;bevel.segments=2
    return o
def area(name,loc,target,power,size,color=(1,.78,.53),shape='DISK',size_y=None):
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape=shape;d.size=size;d.color=color
    if size_y is not None:d.size_y=size_y
    o=bpy.data.objects.new(name,d);s.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();return o
def text(name,body,loc,size,m):
    d=bpy.data.curves.new(name,'FONT');d.body=body;d.align_x='CENTER';d.size=size;d.space_character=1.18;d.extrude=.008;d.bevel_depth=.002;d.materials.append(m)
    o=bpy.data.objects.new(name,d);s.collection.objects.link(o);o.location=loc;o.rotation_euler=(math.pi/2,0,0);return o
def arch(name,center,width,spring,height,r,m,side=False):
    cx,cy=center
    pts=[(-width,0),(-width,spring)]+[(width*math.cos(math.pi-i*math.pi/80),spring+height*math.sin(math.pi-i*math.pi/80)) for i in range(81)]+[(width,0)]
    return curve(name,[(cx,cy+u,z) if side else (cx+u,cy,z) for u,z in pts],r,m)

brass=mat('Antique champagne brass','#b79759',.24,.78)
gold=mat('Handwoven zari gold','#c9a963',.32,.62)
darkmetal=mat('Burnished bronze','#463324',.29,.8)
warm=mat('Champagne light diffuser','#ffe8b9',.38,emission=4)
crystal=mat('Cut champagne crystal','#ead3b3',.13,.18)
crystal.node_tree.nodes['Principled BSDF'].inputs['Coat Weight'].default_value=.8
walnut=texture(mat('Bookmatched dark walnut','#4b291a',.32),('#23130d','#67422a'),(7,7,.12),5,.13,.002)
ebony=texture(mat('Smoked oak coffer','#241914',.36),('#17110d','#3f2e20'),(8,.12,8),4,.1,.001)
plaster=texture(mat('Warm limestone plaster','#d6c4a4',.7),('#b8a98c','#e2d4b6'),(1.8,1.8,1.8),3,.15,.003)
marble=texture(mat('Breccia ivory marble','#ded1b9',.2),('#736651','#f3e9d5'),(.9,.16,.25),7,.035,.0008)
onyx=texture(mat('Honey onyx','#b89254',.24),('#573a20','#e5c688'),(2,.15,1.1),5,.04,.001)
noir=texture(mat('Emperador espresso marble','#30251e',.2),('#201813','#66563c'),(.7,.7,.7),6,.04,.001)
wine=texture(mat('Oxblood velvet upholstery','#481725',.74),('#32131c','#65263c'),(4,4,4),2,.05,.002)
wine.node_tree.nodes['Principled BSDF'].inputs['Sheen Weight'].default_value=.55
wine_stone=texture(mat('Polished garnet pilasters','#491723',.23),('#2b1017','#592537'),(.8,.8,.3),5,.05,.0007)
wine_stone.node_tree.nodes['Principled BSDF'].inputs['Coat Weight'].default_value=.45
ivory=mat('Pearl silk velvet','#caba9c',.63);ivory.node_tree.nodes['Principled BSDF'].inputs['Sheen Weight'].default_value=.4

def silk(name,color,accent):
    m=mat(name,color,.3,.12);p=m.node_tree.nodes['Principled BSDF'];p.inputs['Sheen Weight'].default_value=.48;p.inputs['Anisotropic'].default_value=.3
    n=m.node_tree.nodes;l=m.node_tree.links;tc=n.new('ShaderNodeTexCoord');mapping=n.new('ShaderNodeVectorMath');mapping.operation='MULTIPLY';mapping.inputs[1].default_value=(34,34,34);l.new(tc.outputs['UV'],mapping.inputs[0])
    wave=n.new('ShaderNodeTexWave');wave.wave_type='BANDS';wave.bands_direction='X';wave.inputs['Scale'].default_value=1;wave.inputs['Distortion'].default_value=.35;l.new(mapping.outputs[0],wave.inputs['Vector'])
    cross=n.new('ShaderNodeTexWave');cross.wave_type='BANDS';cross.bands_direction='Y';cross.inputs['Scale'].default_value=1;cross.inputs['Distortion'].default_value=.35;l.new(mapping.outputs[0],cross.inputs['Vector'])
    motif=n.new('ShaderNodeMath');motif.operation='MULTIPLY';l.new(wave.outputs['Fac'],motif.inputs[0]);l.new(cross.outputs['Fac'],motif.inputs[1])
    ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.86;ramp.color_ramp.elements[0].color=rgb(color);ramp.color_ramp.elements[1].position=.96;ramp.color_ramp.elements[1].color=rgb(accent);l.new(motif.outputs[0],ramp.inputs[0]);l.new(ramp.outputs[0],p.inputs['Base Color'])
    fine=n.new('ShaderNodeTexNoise');fine.inputs['Scale'].default_value=300;l.new(tc.outputs['UV'],fine.inputs['Vector']);bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.13;bump.inputs['Distance'].default_value=.0003;l.new(fine.outputs['Fac'],bump.inputs['Height']);l.new(bump.outputs[0],p.inputs['Normal'])
    return m
silks=[silk('Mulberry Banarasi silk','#661a31','#8d4e40'),silk('Jade Kanjivaram silk','#173f37','#547355'),silk('Saffron tissue silk','#a96720','#c5a158'),silk('Midnight woven silk','#1b2941','#586374'),silk('Rose gold silk','#b47766','#d0ae87'),silk('Champagne brocade','#c7b79b','#dfd0ae')]
bridal=silk('Crimson bridal brocade','#821c28','#b26739')

# A woven paisley repeat, authored as a mask rather than a photographic cloth plane.
def brocade(name,base,repeat=(4,6,1)):
    m=mat(name,base,.39,.12);p=m.node_tree.nodes['Principled BSDF'];p.inputs['Sheen Weight'].default_value=.25
    n=m.node_tree.nodes;l=m.node_tree.links;tc=n.new('ShaderNodeTexCoord');mp=n.new('ShaderNodeVectorMath');mp.operation='MULTIPLY';mp.inputs[1].default_value=repeat;l.new(tc.outputs['UV'],mp.inputs[0])
    im=n.new('ShaderNodeTexImage');im.image=bpy.data.images.load(str(ROOT/'public/textures/showroom/zari-paisley.png'),check_existing=True);im.image.colorspace_settings.name='Non-Color';im.extension='REPEAT';l.new(mp.outputs[0],im.inputs['Vector'])
    mix=n.new('ShaderNodeMixRGB');mix.inputs[1].default_value=rgb(base);mix.inputs[2].default_value=rgb('#bb924c');l.new(im.outputs['Color'],mix.inputs[0]);l.new(mix.outputs[0],p.inputs['Base Color'])
    bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.2;bump.inputs['Distance'].default_value=.0007;l.new(im.outputs['Color'],bump.inputs['Height']);l.new(bump.outputs[0],p.inputs['Normal'])
    return m
bridal=brocade('Crimson Banarasi paisley saree','#650d24',(3.5,5.4,1))
jade_brocade=brocade('Bottle green floral zari saree','#123b2f',(3,5,1))
indigo_brocade=brocade('Indigo woven paisley saree','#192846',(3.5,5,1))
zari=brocade('Antique zari pallu brocade','#967043',(5,8,1))

def surface(name,fn,nx,nz,m,border=True):
    verts=[];faces=[];uv=[]
    for j in range(nz+1):
        for i in range(nx+1):
            u=i/nx;v=j/nz;verts.append(fn(u,v));uv.append((u,v))
    for j in range(nz):
        for i in range(nx):
            a=j*(nx+1)+i;faces.append((a,a+1,a+nx+2,a+nx+1))
    o=mesh(name,verts,faces,m);o.data.materials.append(zari);o.data.materials.append(gold);layer=o.data.uv_layers.new(name='Woven length')
    for p in o.data.polygons:
        p.use_smooth=True;i=p.index%nx;j=p.index//nx
        if border and (i<3 or i>nx-4 or j<7):p.material_index=1
        if border and j in [1,6,8]:p.material_index=2
        for idx in p.loop_indices:layer.data[idx].uv=uv[o.data.loops[idx].vertex_index]
    sol=o.modifiers.new('Real cloth selvedge','SOLIDIFY');sol.thickness=.002
    return o

def saree(name,x,y,m,scale=1,mirror=1):
    # Draped over an unobtrusive textile hanger, with a fan of narrow front pleats.
    # Asymmetric pallu, a broad zari end and fabric lying on the stone: no human form.
    def world(xx,yy,zz):return (x+mirror*xx*scale,y+yy*scale,zz*scale+.04)
    def pleats(u,v):
        theta=u*math.tau+math.pi/2
        radius=.49*(1-v)+.235*v
        folds=.039*math.sin(u*math.tau*24)*(1-.48*v)
        radius+=folds
        xx=radius*math.cos(theta)-.06
        z=.09+v*1.28+.018*math.sin(u*math.tau*24)*(1-v)**3
        yy=radius*.72*math.sin(theta)+.09
        return world(xx,yy,z)
    surface(name+' wrapped and pleated lower length',pleats,144,80,m)
    def wrap(u,v):
        theta=u*math.tau+math.pi/2
        radius=.235+.04*math.sin(v*math.pi)+.008*math.sin(u*math.tau*12)
        xx=radius*math.cos(theta)-.06+.11*v
        zz=1.35+v*.67+v*.09*math.cos(theta)
        yy=radius*.69*math.sin(theta)+.10+.018*math.sin(u*math.tau*5+v*2)
        return world(xx,yy,zz)
    surface(name+' overlapping silk wrap',wrap,110,65,m)
    def pallu(u,v):
        # The pallu crosses the pleats diagonally before returning over the rail.
        xx=-.30+.66*v+(u-.5)*(.43+.1*(1-v));zz=.12+v*2.05+.06*math.sin(u*math.pi)*(1-v)
        yy=-.29+.025*math.sin(u*math.tau*5)+.20*(1-v)**9
        return world(xx,yy,zz)
    surface(name+' diagonal zari pallu',pallu,80,110,m)
    def train(u,v):
        xx=-.30+(u-.5)*.54;yy=-.09-.48*v;zz=.055+.019*math.sin(u*math.tau*6)+.045*(1-v)**4
        return world(xx,yy,zz)
    surface(name+' pooled pallu end',train,65,40,zari,False)
    # Short silk tassels read clearly in the final close view.
    for i in range(18):
        xx=-.565+i*.031
        curve(name+' pallu tassel',[world(xx,-.57,.052),world(xx+.009,-.63,.04)],.0035*scale,gold)
    curve(name+' fine garment support',[world(-.26,.1,2.05),world(.05,.1,2.08),world(.39,.1,2.20)],.016*scale,brass)
    cylinder(name+' slender display rail',(x+.19*mirror*scale,y+.06,1.13*scale),.015,2.15*scale,brass,20)
    cylinder(name+' stone foot',(x,y,.045),.45*scale,.09,noir,64)

def folded_saree(name,x,y,z,m,w=.79,d=.47,h=.067,side=0):
    # Soft folded edges and a visible doubled leaf replace featureless cuboids.
    size=(d,w,h) if side else (w,d,h)
    cube(name,(x,y,z),size,m,.025)
    xx=x-side*(d/2+.002) if side else x+w/2-.032
    cube(name+' zari fold',(xx,y+w/2-.08 if side else y,z+.001),(.003,.105,h*.80) if side else (.067,d*.98,h*.74),zari,.001)
    cube(name+' doubled leaf',(x,y,z+h*.34),((d*.98,w*.985,.007) if side else (w*.985,d*.98,.007)),m,.002)

def cloth(name,loc,width,height,m,side=0,fold=.11,pool=.18,hero=False):
    nx=80;nz=90;verts=[];faces=[];uv=[]
    for j in range(nz+1):
        v=j/nz
        for i in range(nx+1):
            u=i/nx;x=(u-.5)*width
            wave=fold*(math.sin(u*math.tau*8+.18*math.sin(v*math.pi))+ .28*math.sin(u*math.tau*17))
            y=wave+pool*math.exp(-v*13)
            z=v*height+.028*math.sin(u*math.tau*8)*(1-v)**5
            if hero:
                y+=.47*math.sin(u*math.pi)*math.sin(v*math.pi)
                z+=.42*math.cos(u*math.pi*2)*math.sin(v*math.pi*.8)
            verts.append((loc[0]+(y if side else x),loc[1]+(x if side else y),loc[2]+z));uv.append((u,v))
    for j in range(nz):
        for i in range(nx):
            a=j*(nx+1)+i;faces.append((a,a+1,a+nx+2,a+nx+1))
    o=mesh(name,verts,faces,m);o.data.materials.append(gold);layer=o.data.uv_layers.new(name='Saree weave')
    for p in o.data.polygons:
        p.use_smooth=True
        j=p.index//nx;i=p.index%nx
        if j<5 or j>nz-3 or i<2 or i>nx-3 or (j in (8,10,12)):p.material_index=1
        for idx in p.loop_indices:layer.data[idx].uv=uv[o.data.loops[idx].vertex_index]
    sol=o.modifiers.new('Cloth thickness','SOLIDIFY');sol.thickness=.002
    return o

# A completely new, taller, layered room. Warm stone centres and dark edges.
cube('Marble structural floor',(0,9.6,-.15),(11.6,24,.3),noir)
for y in range(-2,22,2):
    for x in [-3.2,-1.6,0,1.6,3.2]:
        slab=cube('Bookmatched marble slab',(x,y+.95,.005),(1.586,1.886,.035),marble,.008)
        if (y//2)%2:slab.rotation_euler.z=math.pi
    for x in [-4.3,4.3]:cube('Marble border',(x,y+.95,.002),(.5,1.886,.032),onyx,.003)
for x in [-4.57,-4.03,-.88,.88]:cube('Fine brass floor inlay',(x,9.5,.027),(.014,23,.008),brass,.001)
for x in [-5.85,5.85]:
    cube('Walnut perimeter wall',(x,9.5,2.9),(.3,24,5.8),walnut)
    cube('Emperador stone skirting',(x*.96,9.5,.23),(.3,24,.46),noir)
    for z in [.1,.43,4.84,5.34]:cube('Continuous gilt cornice',(x*.963,9.5,z),(.22,24,.055),brass,.008)
    cube('Deep walnut entablature',(x*.945,9.5,5.08),(.6,24,.48),walnut)
    cube('Hidden cove glow',(x*.91,9.5,5.37),(.05,24,.055),warm)
cube('Rear walnut wall',(0,21.85,2.9),(11.6,.3,5.8),walnut)
cube('Dark recessed ceiling',(0,9.5,5.87),(11.6,24,.16),ebony)

# Raised ceiling coffers, framed with two brass reveals, with a central vaulted spine.
for y in [0,4.5,9,13.5,18]:
    cube('Coffered crossbeam',(0,y,5.53),(11.2,.28,.5),walnut)
    for dy in [-.18,.18]:cube('Coffer gilded edge',(0,y+dy,5.33),(11.2,.027,.035),brass,.005)
    for x in [-3.9,3.9]:
        cube('Coffer onyx inset',(x,y+2.2,5.76),(2.15,3.75,.025),onyx)
        for dx in [-1.06,1.06]:cube('Ceiling inset moulding',(x+dx,y+2.2,5.68),(.055,3.78,.12),brass)
        for dy in [-1.87,1.87]:cube('Ceiling inset moulding',(x,y+2.2+dy,5.68),(2.15,.055,.12),brass)
for x in [-2.35,2.35]:
    cube('Vault shoulder beam',(x,9.5,5.58),(.27,23,.36),walnut)
    cube('Vault brass reveal',(x-math.copysign(.15,x),9.5,5.43),(.025,23,.045),brass)

# Five distinct alcoves on each side, fluted columns and softly lit silks.
for side in [-1,1]:
    for index,y in enumerate([1.5,5.6,9.7,13.8,17.9]):
        x=side*5.42
        cube('Textile alcove shadow',(x,y,2.65),(.16,3.48,4.55),noir)
        cube('Alcove limestone lining',(x-side*.07,y,2.65),(.08,3.08,4.18),plaster)
        arch('Sculpted brass niche',(x-side*.17,y),1.57,3.35,1.18,.045,brass,True)
        arch('Inner illuminated arch',(x-side*.12,y),1.43,3.35,1.04,.018,warm,True)
        cube('Walnut display credenza',(side*5.08,y,.43),(.65,3.2,.82),walnut,.045)
        cube('Stone credenza top',(side*5.02,y,.87),(.88,3.3,.11),marble,.018)
        for yy in [-1.35,-.45,.45,1.35]:cube('Cabinet drawer gilt stile',(side*4.734,y+yy,.44),(.02,.018,.65),brass,.001)
        for yy in [-.9,0,.9]:
            curve('Drawer sculpted handle',[(side*4.70,y+yy-.11,.45),(side*4.66,y+yy,.45),(side*4.70,y+yy+.11,.45)],.013,brass)
        # Layered colour libraries, as in the reference's actual saree showroom.
        for level in range(6):
            z=1.11+level*.43
            cube('Walnut textile library shelf',(side*5.09,y,z),(.68,3.02,.055),walnut,.009)
            cube('Library shelf brass nosing',(side*4.735,y,z),(.019,3.04,.039),brass,.002)
            cube('Shelf recessed illumination',(side*5.20,y,z+.09),(.019,2.9,.019),warm,.001)
            for k,offset in enumerate([-1.07,-.35,.35,1.07]):
                for fold_index in range(3):
                    folded_saree('Folded silk colour library',side*4.98,y+offset,z+.055+fold_index*.074,silks[(index+level+k+fold_index+(1 if side>0 else 0))%6],w=.62,d=.48,h=.070,side=side)
        area('Alcove silk illumination',(side*4.55,y,4.50),(side*5.1,y,2.3),155,1.4,(1,.87,.67))
        # Gold/fluted pilasters alternate with the wardrobes.
        yy=y-1.92
        cube('Garnet stone pilaster',(side*5.19,yy,2.65),(.52,.42,5.18),wine_stone)
        for k in range(7):
            cylinder('Fluted brass pilaster',(side*4.89,yy-.16+k*.053,2.65),.012,4.89,brass,12)
        for z in [.28,4.96]:cube('Pilaster stone capital',(side*5.15,yy,z),(.65,.57,.22),onyx)

# Signature chandeliers: concentric brass crowns and hundreds of faceted prisms.
for station,y in enumerate([1.2,7.5,13.8]):
    for rx,ry,z in [(1.63,1.06,4.88),(1.42,.91,4.57),(1.05,.69,4.32)]:
        ellipse('Chandelier bronze crown',(0,y,z),rx,ry,.055,brass)
        ellipse('Chandelier luminous ribbon',(0,y,z-.033),rx,ry,.014,warm)
        for i in range(60):
            a=i*math.tau/60;xx=rx*math.cos(a);yy=y+ry*math.sin(a);height=.26+.19*(.5+.5*math.cos(a*4+station))
            cylinder('Cut crystal chandelier pendant',(xx,yy,z-height/2-.045),.028,height,crystal,6)
            cylinder('Fine gold pendant core',(xx,yy,z-height/2-.045),.006,height,brass,8)
    for x in [-.8,.8]:curve('Chandelier suspension',[(x,y,5.8),(x,y,4.9)],.01,brass)
    area('Chandelier soft light',(0,y,4.48),(0,y,0),470,3.2,(1,.85,.64))

# A sculptural consultation island, a softly gathered textile runner and velvet salons.
def sofa(name,x,y,flip=False):
    cube(name+' plinth',(x,y,.18),(2.15,1.15,.2),darkmetal,.08)
    cube(name+' upholstered seat',(x,y,.43),(2.23,1.21,.39),wine,.17)
    cube(name+' curved back',(x,y+.48,.94),(2.27,.33,.87),wine,.16)
    for dx in [-1,1]:cube(name+' low rolled arm',(x+dx,y,.67),(.33,1.16,.52),wine,.16)
    for dx in [-.55,.55]:
        pillow=cube(name+' silk cushion',(x+dx,y+.20,.93),(.54,.22,.51),ivory,.14);pillow.rotation_euler.x=-.15;pillow.rotation_euler.y=dx*.2
    for dx in [-.9,.9]:cylinder(name+' bronze foot',(x+dx,y-.36,.12),.042,.22,brass)
sofa('Left private salon',-3.5,15.9)
sofa('Right private salon',3.5,15.9)
for x in [-3.4,3.4]:
    cylinder('Onyx salon table',(x,14.35,.55),.6,.13,onyx,80)
    cylinder('Bronze table stem',(x,14.35,.31),.23,.48,brass,48)
    cylinder('Table foot',(x,14.35,.07),.42,.1,noir,64)
    cylinder('Turned brass vase',(x+.12,14.35,.82),.09,.42,brass,48)
    for a in range(7):
        angle=a*math.tau/7;curve('Sculptural gold botanical stem',[(x+.12,14.35,.94),(x+.12+.12*math.cos(angle),14.35+.12*math.sin(angle),1.2+.035*a)],.008,brass)

# Rear ceremonial arch and billowing bridal silk, displayed without a human form.
cube('Rear monumental onyx panel',(0,21.51,2.95),(6.45,.19,5.7),onyx,.04)
for x in [-3.4,3.4]:
    cube('Rear fluted walnut pillar',(x,21.20,2.83),(.5,.65,5.65),walnut,.04)
    for dx in [-.15,-.075,0,.075,.15]:cylinder('Rear gilt flute',(x+dx,20.855,2.84),.012,5.45,brass,12)
arch('Grand bridal arch',(0,21.15),3.05,3.3,2.05,.11,brass)
arch('Grand arch inner cove',(0,21.23),2.86,3.3,1.86,.027,warm)
arch('Arch carved stone inner border',(0,21.33),2.79,3.3,1.78,.072,plaster)
for i in range(35):cube('Radial rear walnut reeds',(-2.5+i*.147,21.31,2.32),(.065,.09,4.38),walnut,.025)
text('AIRA cast brass house mark','A I R A',(0,21.04,4.37),.46,brass)
text('House insignia','THE PRIVATE SALON',(0,21.035,4.04),.085,brass)
area('Rear house mark light',(0,20.35,4.9),(0,21.05,4.3),130,2.3,(1,.9,.74))
saree('Signature crimson bridal saree',.25,20.30,bridal,1.45,1)
saree('Champagne silk drape',-1.80,20.87,silks[5],1.06,-1)
saree('Jade silk drape',2.13,20.92,jade_brocade,1.08,1)
# Three folded bridal lengths on a low stone display bench.
cube('Bridal marble viewing bench',(0,19.9,.21),(3.7,.85,.31),marble,.09)
for k in range(3):
    folded_saree('Bridal bench folded length',-.68+k*.68,19.59,.4,silks[(k+4)%6],w=.58,d=.47,h=.06)
for x in [-2.3,2.3]:area('Bridal grazing light',(x,19.8,3.85),(0,20.8,1.9),190,1.2,(1,.84,.6))

# Furniture aside from the aisle: the camera can pass through the centre uninterrupted.
for side in [-1,1]:
    x=side*3.18;y=8.6
    cylinder('Consultation sculpted table base',(x,y,.55),.64,1.07,walnut,80)
    # Elliptical tabletops, no primitive square showroom counters.
    table=cylinder('Oval consultation marble top',(x,y,1.08),1.28,.14,marble,112)
    for vertex in table.data.vertices:vertex.co.x=x+(vertex.co.x-x)*.72
    ellipse('Table gilt perimeter',(x,y,1.147),.918,1.274,.008,brass)
    for k in range(4):
        folded=cube('Folded silk on consultation table',(x-.16,y-.4+k*.27,1.195),(.66,.43,.065),silks[(k+(0 if side<0 else 2))%6],.028)
        cube('Folded silk zari selvedge',(x+.155,y-.4+k*.27,1.23),(.035,.4,.003),gold,.002)
    # Petite matching velvet stool.
    cylinder('Velvet consultation stool',(side*2.48,y-1.9,.48),.47,.21,wine,72)
    cylinder('Stool bronze base',(side*2.48,y-1.9,.25),.26,.32,brass,48)

# Individual saree silhouettes make the entrance unmistakably a fashion boutique.
saree('Entrance wine Banarasi',-3.63,4.4,bridal,.98,-1)
saree('Entrance jade Kanjivaram',3.65,4.5,jade_brocade,.98,1)
saree('Salon indigo saree',-3.56,11.65,indigo_brocade,.94,-1)
saree('Salon saffron saree',3.62,11.78,silks[2],.94,1)

# Balanced photographic lighting: neutral silk colours with warm accents.
for y in [0,5,10,15,19]:
    area('Soft aisle ceiling fill',(0,y,5.65),(0,y+1,1),430,4.2,(1,.92,.81))
for x in [-3.6,3.6]:
    area('Entrance daylight',(x,-2.0,3.4),(x/2,7,1.6),720,4.6,(1,.94,.87))
area('Rear salon bounce',(0,18.3,4.95),(0,20.7,1.2),310,3.8,(1,.92,.8))
world=bpy.data.worlds.new('AIRA soft ambient');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.27,.22,.17,1);world.node_tree.nodes['Background'].inputs[1].default_value=.38;s.world=world

# New central path travels to the cloth itself. Nothing targets a removed figure.
d=bpy.data.cameras.new('AIRA salon camera');o=bpy.data.objects.new('AIRA salon camera',d);s.collection.objects.link(o);s.camera=o;d.lens=24;d.sensor_width=36;d.clip_start=.1;d.clip_end=100;d.dof.use_dof=False
keys=[(0,(-.20,-2.1,1.85),(0,13.5,2.20)),(48,(-.25,3.4,1.84),(0,19.8,2.15)),(102,(-.05,10.5,1.80),(.15,20.5,2.12)),(144,(.05,15.65,1.75),(.20,20.4,1.75)),(167,(.15,18.65,1.64),(.35,20.30,1.60))]
for frame,loc,target in keys:
    o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();o.keyframe_insert('location',frame=frame);o.keyframe_insert('rotation_euler',frame=frame)
for fc in o.animation_data.action.fcurves:
    for k in fc.keyframe_points:k.interpolation='BEZIER';k.handle_left_type='AUTO_CLAMPED';k.handle_right_type='AUTO_CLAMPED'
s.frame_start=0;s.frame_end=167;s.render.fps=24;s.render.engine='BLENDER_EEVEE_NEXT';s.eevee.taa_render_samples=32;s.eevee.use_raytracing=True;s.eevee.shadow_pool_size='1024'
s.render.resolution_x=1440;s.render.resolution_y=810;s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG'
s.view_settings.view_transform='AgX';s.view_settings.look='AgX - Medium High Contrast';s.view_settings.exposure=-.65
# Restrained optical bloom catches the real luminaires, never a full-frame filter.
s.use_nodes=True;n=s.node_tree.nodes;n.clear();l=s.node_tree.links
rl=n.new('CompositorNodeRLayers');gl=n.new('CompositorNodeGlare');gl.glare_type='FOG_GLOW';gl.quality='HIGH';gl.threshold=2;gl.size=7;gl.mix=-.94
co=n.new('CompositorNodeComposite');l.new(rl.outputs['Image'],gl.inputs['Image']);l.new(gl.outputs['Image'],co.inputs['Image'])
s.frame_set(0)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'aira-store-v9.blend'))
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'aira-store-v9.blend'))
(OUT/'scene-report.json').write_text(json.dumps({'objects':len(s.objects),'meshes':len(bpy.data.meshes),'materials':len(bpy.data.materials),'authored_pattern_textures':[i.name for i in bpy.data.images if i.source in ('FILE','MOVIE','SEQUENCE')],'photographic_images':[],'lights':len(bpy.data.lights),'human_or_image_planes':0,'camera_keyframes':keys},indent=2))
print('NEW SHOWROOM BUILT',len(s.objects),'objects; no photographic assets',flush=True)
