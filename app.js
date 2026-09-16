const prizes=[
  {name:'Гайд по нейросетям',color:'#6548e8',weight:60},
  {name:'500 бонусных рублей',color:'#967cf8',weight:25},
  {name:'Бесплатный мини-курс',color:'#4934ad',weight:10},
  {name:'+30 дней доступа',color:'#c8bbff',weight:5}
];
const wheel=document.querySelector('#wheel'),button=document.querySelector('#spin'),result=document.querySelector('#result'),message=document.querySelector('#message'),overline=document.querySelector('#overline'),icon=document.querySelector('#resultIcon'),again=document.querySelector('#again'),list=document.querySelector('#prizes');
let rotation=0,busy=false;
const storageKey='prize-wheel-studio-result-v1';

prizes.forEach((prize,index)=>{
  const angle=(index+.5)*360/prizes.length,label=document.createElement('span');
  label.textContent=String(index+1);
  label.style.transform=`translate(-50%,-50%) rotate(${angle}deg) translateY(-34cqw) rotate(${-angle}deg)`;
  wheel.appendChild(label);
  const row=document.createElement('div');row.className='prize';row.innerHTML=`<i style="background:${prize.color}">${index+1}</i><b>${prize.name}</b>`;list.appendChild(row);
});

function choosePrize(){const point=Math.random()*prizes.reduce((sum,item)=>sum+item.weight,0);let cursor=0;return prizes.findIndex(item=>(cursor+=item.weight)>point);}
function showResult(index,restored=false){const prize=prizes[index];icon.textContent='🏆';overline.textContent='ПОЗДРАВЛЯЕМ!';result.textContent=`Ваш приз — ${prize.name}`;message.textContent=restored?'Это результат вашей сохранённой попытки':'Результат сохранён в этом браузере';button.disabled=true;button.innerHTML='<span>✓</span> Попытка завершена';again.hidden=false;}
function reset(){localStorage.removeItem(storageKey);rotation=0;wheel.style.transition='none';wheel.style.transform='rotate(0deg)';requestAnimationFrame(()=>wheel.style.transition='transform 4s cubic-bezier(.12,.75,.18,1)');icon.textContent='🎁';overline.textContent='ВАША ПОПЫТКА ГОТОВА';result.textContent='Нажмите кнопку — и колесо выберет ваш приз';message.textContent='У вас одна попытка в этом розыгрыше';button.disabled=false;button.innerHTML='<span>↻</span> Крутить колесо';again.hidden=true;}

button.addEventListener('click',()=>{if(busy||button.disabled)return;busy=true;button.disabled=true;button.classList.add('busy');button.innerHTML='<span>↻</span> Колесо вращается…';message.textContent='Определяем ваш приз…';const index=choosePrize(),target=360-(index+.5)*360/prizes.length;rotation=Math.ceil(rotation/360)*360+1440+target;wheel.style.transform=`rotate(${rotation}deg)`;setTimeout(()=>{localStorage.setItem(storageKey,String(index));button.classList.remove('busy');busy=false;showResult(index);},4000);});
again.addEventListener('click',reset);
const saved=Number(localStorage.getItem(storageKey));if(Number.isInteger(saved)&&saved>=0&&saved<prizes.length)showResult(saved,true);
