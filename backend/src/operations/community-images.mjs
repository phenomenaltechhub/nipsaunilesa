import {inflateSync,deflateSync}from'node:zlib';
import {fail}from'./common.mjs';
const signature=Buffer.from([137,80,78,71,13,10,26,10]);
export function crc32(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;}
function chunk(kind,data){const type=Buffer.from(kind),out=Buffer.alloc(data.length+12);out.writeUInt32BE(data.length);type.copy(out,4);data.copy(out,8);out.writeUInt32BE(crc32(Buffer.concat([type,data])),out.length-4);return out;}
export function inspectPng(base64){
 if(typeof base64!=='string')fail(400,'INVALID_IMAGE');if(base64.length>1398104)fail(413,'IMAGE_TOO_LARGE','Images must be no larger than 1 MB.');if(base64.length%4!==0||!/^[A-Za-z0-9+/]*={0,2}$/.test(base64))fail(400,'INVALID_IMAGE');
 const bytes=Buffer.from(base64,'base64');if(bytes.toString('base64')!==base64)fail(400,'INVALID_IMAGE');if(bytes.length>1048576)fail(413,'IMAGE_TOO_LARGE','Images must be no larger than 1 MB.');if(bytes.length<45||!bytes.subarray(0,8).equals(signature))fail(415,'INVALID_IMAGE','Choose a PNG image; other images must be converted safely first.');
 let offset=8,header=null,parts=[],ended=false,sawData=false,dataEnded=false;
 while(offset<bytes.length){if(offset+12>bytes.length)fail(415,'INVALID_IMAGE');const n=bytes.readUInt32BE(offset);if(n>1048576||offset+n+12>bytes.length)fail(415,'INVALID_IMAGE');const type=bytes.toString('ascii',offset+4,offset+8),data=bytes.subarray(offset+8,offset+8+n);if(crc32(bytes.subarray(offset+4,offset+8+n))!==bytes.readUInt32BE(offset+8+n))fail(415,'INVALID_IMAGE');
 if(!header&&type!=='IHDR')fail(415,'INVALID_IMAGE');if(type==='IHDR'){if(header||n!==13)fail(415,'INVALID_IMAGE');header=Buffer.from(data);}
 else if(type==='IDAT'){if(dataEnded)fail(415,'INVALID_IMAGE');sawData=true;parts.push(data);}
 else if(type==='IEND'){if(n||!sawData||offset+n+12!==bytes.length)fail(415,'INVALID_IMAGE');ended=true;break;}
 else{if(!/^[a-z][A-Za-z]{3}$/.test(type)||['acTL','fcTL','fdAT'].includes(type))fail(415,'INVALID_IMAGE');if(sawData)dataEnded=true;}
 offset+=n+12;
 }
 if(!header||!ended)fail(415,'INVALID_IMAGE');const width=header.readUInt32BE(0),height=header.readUInt32BE(4),channels=header[9]===6?4:header[9]===2?3:0;
 if(!width||!height||width>2048||height>2048||width*height>4194304||header[8]!==8||!channels||header[10]||header[11]||header[12])fail(415,'IMAGE_DIMENSIONS','Use a non-animated RGB/RGBA PNG up to 2048 × 2048 pixels.');
 const row=width*channels+1,maximum=row*height;let decoded;try{decoded=inflateSync(Buffer.concat(parts),{maxOutputLength:maximum});}catch{fail(415,'INVALID_IMAGE');}if(decoded.length!==maximum)fail(415,'INVALID_IMAGE');for(let y=0;y<height;y++)if(decoded[y*row]>4)fail(415,'INVALID_IMAGE');
 // Canonical container: omit metadata, unknown chunks and appended payloads.
 const safe=Buffer.concat([signature,chunk('IHDR',header),chunk('IDAT',deflateSync(decoded)),chunk('IEND',Buffer.alloc(0))]);if(safe.length>1048576)fail(413,'IMAGE_TOO_LARGE');return {bytes:safe,width,height};
}
