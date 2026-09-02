import { ImageResponse } from "next/og";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export default function AppleIcon() { return new ImageResponse(<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#41644A",borderRadius:38}}><div style={{width:92,height:92,display:"flex",alignItems:"center",justifyContent:"center",background:"#FFFCF6",borderRadius:18,position:"relative"}}><div style={{position:"absolute",top:-22,width:50,height:39,border:"10px solid #E9965B",borderBottom:"none",borderRadius:"25px 25px 0 0"}}/><div style={{width:32,height:7,background:"#86A889",borderRadius:4}}/></div></div>,size); }
