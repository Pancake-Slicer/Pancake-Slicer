export const FACADE_STYLE_VERSION='5.0.0';
export const FACADE_STYLES=Object.freeze({
 grid:Object.freeze({name:'Balanced grid',visionDepth:-.12,spandrelDepth:-.07,spandrelThickness:.12,railHeight:.055,railDepth:.025,railThickness:.09,edgeHeight:.012,edgeDepth:.073,edgeThickness:.018,visionRailWidth:.026,visionRailDepth:-.025,visionRailThickness:.045}),
 vertical:Object.freeze({name:'Vertical emphasis',visionDepth:-.20,spandrelDepth:-.13,spandrelThickness:.12,railHeight:.030,railDepth:-.08,railThickness:.06,edgeHeight:.008,edgeDepth:-.046,edgeThickness:.010,visionRailWidth:.014,visionRailDepth:-.15,visionRailThickness:.025,verticalWidth:.13,verticalDepth:-.08,verticalThickness:.38,cornerWidth:.25,cornerInset:.025,cornerReturn:.06}),
 horizontal:Object.freeze({name:'Horizontal emphasis',visionDepth:-.12,spandrelDepth:-.025,spandrelThickness:.20,railHeight:.080,railDepth:.04,railThickness:.09,edgeHeight:.010,edgeDepth:.088,edgeThickness:.010,visionRailWidth:0,verticalWidth:.035,verticalDepth:-.02,verticalThickness:.055,cornerWidth:.25,cornerInset:.025})
});
export function facadeStyle(spec){const value=spec.facadeStyle===undefined?'grid':spec.facadeStyle;if(!Object.hasOwn(FACADE_STYLES,value))throw Error('Unknown facadeStyle; choose vertical, horizontal or grid');return value;}
export function validateFacadeStyle(spec){
 const style=facadeStyle(spec),p=FACADE_STYLES[style],vision=spec.floorHeight-spec.spandrel-.2;
 if(!Number.isInteger(spec.widthBays)||!Number.isInteger(spec.depthBays)||spec.bay<1.8||spec.bay>2.2||vision<=0)throw Error('Facade style requires the existing whole-bay curtain grid');
 if((spec.bay-.09)/vision<.65||(spec.bay-.09)/vision>1.18||spec.lobbyHeight<4.3)throw Error('Facade/lobby proportions are incompatible');
 if(style!=='grid'&&(p.verticalThickness<=0||p.cornerWidth<=0||p.visionDepth<=-.75||p.verticalDepth+p.verticalThickness/2>.13))throw Error('Facade profile exceeds the existing curtain-wall envelope');
 return p;
}
export function withFacadeStyle(spec,value){const next={...structuredClone(spec),facadeStyle:value};validateFacadeStyle(next);return next;}
export function massingSpecification(spec){const {facadeStyle:ignored,...massing}=spec;return massing;}
export function facadeMatrix(benchmark){return [1,7,6].flatMap((index,row)=>['vertical','horizontal','grid'].map((style,col)=>({cell:String.fromCharCode(65+row)+(col+1),row,col,style,spec:withFacadeStyle(benchmark[index],style)})));}
