(function(){
'use strict';
const $=id=>document.getElementById(id);
const css=document.createElement('style');
css.textContent='.scan-panel{max-width:760px;margin:26px auto;padding:25px;background:#fff;border:1px solid #e0e0e5;border-radius:17px}.scan-panel[hidden]{display:none}.scan-panel h2{margin:0 0 10px}.scan-panel p{font-size:13px;line-height:1.6;color:#666}.scan-fields{display:grid;gap:15px;margin-top:18px}.scan-fields label{display:grid;gap:7px;font-weight:700;font-size:13px}.scan-fields input,.scan-fields select{padding:12px;border:1px solid #ccc;border-radius:9px;max-width:100%}.scan-fields button{background:#e30613;color:white;border:0;border-radius:9px;padding:13px;font-weight:700;cursor:pointer}.scan-fields button:disabled{opacity:.6;cursor:wait}.scan-message{font-size:13px;white-space:pre-wrap;margin:12px 0}.scan-panel progress{width:100%;height:14px;accent-color:#e30613}.scan-panel progress[hidden]{display:none}body.dark-mode .scan-panel{background:#24262d;border-color:#555;color:#f4f4f5}body.dark-mode .scan-panel p{color:#c7c8cc}body.dark-mode .scan-fields input,body.dark-mode .scan-fields select{background:#30323a;color:white;border-color:#5a5d67}';
document.head.appendChild(css);
const panel=document.createElement('section');panel.id='scanPanel';panel.className='scan-panel';panel.hidden=true;
panel.innerHTML='<h2>📠 Digitalizar PDF</h2><p>Crie uma cópia em PDF na qual todas as páginas são imagens, simulando um documento escaneado. O conteúdo original deixa de ser selecionável ou pesquisável. Não é OCR.</p><form id="scanForm" class="scan-fields"><label>Escolher PDF<input type="file" id="scanFile" accept=".pdf,application/pdf" required></label><label>Qualidade<select id="scanQuality"><option value="1.2">Compacta (aprox. 86 DPI)</option><option value="2" selected>Equilibrada (aprox. 144 DPI)</option><option value="3">Alta (aprox. 216 DPI)</option></select></label><button id="scanButton" type="submit">Digitalizar e baixar PDF</button></form><progress id="scanProgress" max="100" value="0" hidden></progress><div id="scanMessage" class="scan-message" role="status" aria-live="polite"></div><p>Os arquivos são processados no seu navegador. PDFs com muitas páginas podem consumir bastante memória e gerar arquivos grandes.</p>';
$('uploadArea').after(panel);
const previous=choose;choose=function(id){previous(id);panel.hidden=id!=='scan-pdf';if(id==='scan-pdf'){$('uploadArea').hidden=true;if($('batchBox'))$('batchBox').hidden=true;if($('previewBox'))$('previewBox').hidden=true;if($('compareBox'))$('compareBox').hidden=true;if($('securityBox'))$('securityBox').hidden=true}};
choose(mode.id);
$('scanForm').addEventListener('submit',async e=>{
e.preventDefault();const file=$('scanFile').files[0],btn=$('scanButton'),progress=$('scanProgress'),message=$('scanMessage');
if(!file||!file.name.toLowerCase().endsWith('.pdf')){message.textContent='Selecione um PDF válido.';return}
if(file.size>100*1024*1024){message.textContent='O limite é de 100 MB para o arquivo original.';return}
if(!window.pdfjsLib||!window.jspdf){message.textContent='Bibliotecas PDF indisponíveis. Recarregue a página.';return}
btn.disabled=true;progress.hidden=false;progress.value=0;let documentPdf=null;
try{
documentPdf=await pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
if(documentPdf.numPages>200)throw Error('Limite de 200 páginas por operação.');
const output=new jspdf.jsPDF({unit:'pt',format:'a4',compress:true});output.deletePage(1);
const scale=Number($('scanQuality').value);
for(let i=1;i<=documentPdf.numPages;i++){
const page=await documentPdf.getPage(i),viewport=page.getViewport({scale:1}),scaled=page.getViewport({scale});
if(scaled.width*scaled.height>24000000)throw Error('Página '+i+' grande demais para esta qualidade. Use uma opção menor.');
const canvas=document.createElement('canvas');canvas.width=Math.ceil(scaled.width);canvas.height=Math.ceil(scaled.height);
const context=canvas.getContext('2d',{alpha:false});context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);
await page.render({canvasContext:context,viewport:scaled}).promise;
const image=canvas.toDataURL('image/jpeg',.86);
const pageWidth=viewport.width,pageHeight=viewport.height;
output.addPage([pageWidth,pageHeight],pageWidth>pageHeight?'landscape':'portrait');
output.addImage(image,'JPEG',0,0,pageWidth,pageHeight);
canvas.width=0;canvas.height=0;page.cleanup();progress.value=Math.round(i/documentPdf.numPages*100);message.textContent='Digitalizando página '+i+' de '+documentPdf.numPages+'...';
await new Promise(resolve=>setTimeout(resolve,0));
}
const blob=output.output('blob');if(!blob.size)throw Error('O PDF resultante está vazio.');
const name=file.name.replace(/\.pdf$/i,'')+'-digitalizado.pdf',url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),120000);window.CostaExtras?.record(file.name,name,blob.size);
message.textContent='PDF digitalizado com '+documentPdf.numPages+' página(s). Download iniciado.';
}catch(err){console.error(err);message.textContent='Não foi possível digitalizar: '+(err.message||'Erro desconhecido')}finally{if(documentPdf)await documentPdf.destroy();btn.disabled=false;progress.hidden=true}
});
})();