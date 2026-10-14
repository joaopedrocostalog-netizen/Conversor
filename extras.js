(function(){
'use strict';
const $=id=>document.getElementById(id);
const css=document.createElement('style');
css.textContent='.extra{border:1px solid #e5e5e9;border-radius:14px;padding:20px;margin:20px 0;background:white}.extra[hidden]{display:none}.extra h3{margin:0 0 10px}.extra p{font-size:13px;color:#74747c}.extra .controls{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}.extra input,.extra select,.extra button{padding:10px;border:1px solid #ddd;border-radius:8px;max-width:100%}.extra button{cursor:pointer;background:#fff}.extra .primary{background:#e30613;color:#fff}.extra .result{white-space:pre-wrap;font-size:13px;color:#595960}.extra canvas,.extra img{max-width:100%;height:auto}.extra pre{white-space:pre-wrap;word-break:break-word;max-height:360px;overflow:auto}.extra table{width:100%;border-collapse:collapse;font-size:12px}.extra td,.extra th{border-bottom:1px solid #eee;padding:7px;text-align:left}';
document.head.appendChild(css);
const batch=document.createElement('section');batch.className='extra';batch.id='batchBox';batch.innerHTML='<h3>📦 Conversão em lote</h3><p>Selecione até 20 arquivos do tipo compatível com esta ferramenta. Os resultados serão baixados em um ZIP.</p><div class="controls"><input id="batchInput" type="file" multiple aria-label="Arquivos para conversão em lote"><select id="batchOutput"></select><button id="batchGo" class="primary">Converter lote</button></div><div id="batchMessage" class="result" role="status"></div>';
const hist=document.createElement('section');hist.className='extra';hist.id='historyBox';hist.innerHTML='<h3>🕘 Histórico de conversões</h3><p>Somente nomes, tamanho e data são salvos neste navegador, nunca o conteúdo dos arquivos.</p><button id="historyClear">Limpar histórico</button><div id="historyResult"></div>';
$('uploadArea').after(batch);$('homeCards').after(hist);
const KEY='costalog-conversion-history-v1';let events=[];
try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(x))events=x.slice(0,100)}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(events))}catch(e){}}
function historyRender(){const root=$('historyResult');root.replaceChildren();if(!events.length){root.textContent='Nenhuma conversão registrada.';return}const table=document.createElement('table');const head=document.createElement('tr');for(const x of ['Data','Original','Convertido','KB']){const th=document.createElement('th');th.textContent=x;head.appendChild(th)}table.appendChild(head);for(const item of events){const row=document.createElement('tr');for(const x of [new Date(item.t).toLocaleString('pt-BR'),item.src,item.name,(item.size/1024).toFixed(1)]){const td=document.createElement('td');td.textContent=x;row.appendChild(td)}table.appendChild(row)}root.appendChild(table)}
window.CostaExtras={record(src,name,size){events.unshift({t:new Date().toISOString(),src,name,size});events=events.slice(0,100);save();historyRender()}};
$('historyClear').addEventListener('click',()=>{if(confirm('Limpar histórico local?')){events=[];save();historyRender()}});historyRender();
const originalChoose=choose;
choose=function(id){originalChoose(id);const active=!['home','analysis','sign'].includes(mode.id);batch.hidden=!active;hist.hidden=mode.id!=='home';if(active){$('batchInput').accept=mode.accept;$('batchOutput').replaceChildren();for(const type of outputTypes()){const o=document.createElement('option');o.value=type;o.textContent=type.toUpperCase();$('batchOutput').appendChild(o)}}};
choose('home');
$('batchGo').addEventListener('click',async()=>{
const files=Array.from($('batchInput').files),out=$('batchOutput').value,btn=$('batchGo');if(!files.length){$('batchMessage').textContent='Selecione arquivos.';return}
if(files.length>20){$('batchMessage').textContent='Limite de 20 arquivos por lote.';return}
if(files.some(f=>!mode.accept.split(',').includes('.'+ext(f))||f.size>100*1024*1024)){$('batchMessage').textContent='Formato incompatível ou arquivo maior que 100 MB.';return}
if(!window.JSZip){$('batchMessage').textContent='Biblioteca ZIP indisponível.';return}
const prior=uploaded,zip=new JSZip(),names=new Set(),errors=[];btn.disabled=true;
try{for(let i=0;i<files.length;i++){const file=files[i];$('batchMessage').textContent='Processando '+(i+1)+'/'+files.length+': '+file.name;try{uploaded=file;const blob=await convertSelectedFile(ext(file),out);if(!blob||!blob.size)throw Error('Arquivo vazio');const base=file.name.replace(/\.[^.]+$/,'');let name=base+'.'+out,n=2;while(names.has(name)){name=base+'-'+n+'.'+out;n++}names.add(name);zip.file(name,blob);window.CostaExtras.record(file.name,name,blob.size)}catch(err){errors.push(file.name+': '+err.message)}}
if(names.size){const result=await zip.generateAsync({type:'blob'}),url=URL.createObjectURL(result),link=document.createElement('a');link.href=url;link.download='costalog-lote.zip';link.click();setTimeout(()=>URL.revokeObjectURL(url),60000)}
$('batchMessage').textContent=names.size+' arquivo(s) convertido(s).'+(errors.length?'\nFalhas: '+errors.join('; '):'');
}finally{uploaded=prior;btn.disabled=false}
});
})();