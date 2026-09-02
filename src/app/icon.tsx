import { ImageResponse } from "next/og";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";
export const dynamic = "force-static";
export default function Icon() { return new ImageResponse(<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#41644A",borderRadius:112}}><div style={{width:260,height:260,display:"flex",alignItems:"center",justifyContent:"center",background:"#FFFCF6",borderRadius:48,position:"relative"}}><div style={{position:"absolute",top:-62,width:142,height:110,border:"28px solid #E9965B",borderBottom:"none",borderRadius:"70px 70px 0 0"}}/><div style={{width:92,height:18,background:"#86A889",borderRadius:9}}/></div></div>,size); }
