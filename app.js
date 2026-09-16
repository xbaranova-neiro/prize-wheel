const rounds=[
  {label:'ПЕРВАЯ ПРОКРУТКА',prizes:[
    {title:'Золотой стандарт промптинга: 10 формул точных запросов к ИИ',description:'Практический гайд для маркетологов, экспертов и предпринимателей.',file:'1AebI8-wvOpULr8jOix98V1KqxdyGPjHv'},
    {title:'Нейросети без VPN и зарубежных карт: актуальный гид 2026–2027',description:'Практическое руководство по бесперебойному доступу к передовым ИИ-моделям из России.',file:'1VJR-JI_FwMOTpOhIPwtTNkyedTsRqxGU'},
    {title:'20 услуг, которые вы сможете продавать через вайб-кодинг',description:'Что создавать, кому предлагать в России и сколько на этом зарабатывать.',file:'1H7k4hvx__l5ypCi_8aovd8vAUAJyaxRx'},
    {title:'План Б: как не потерять проекты и данные из-за блокировок',description:'Система, которая вернёт вам контроль, если сервис закроется, аккаунт заблокируют или устройство сломается.',file:'1n5cc1NRbwOmQIJczsR1ZTvvlMdSab1ZX'}
  ]},
  {label:'ВТОРАЯ ПРОКРУТКА',prizes:[
    {title:'Промпт-пак «ИИ-маркетолог»',description:'Глубокий анализ целевой аудитории и конкурентов за 10 минут: пошаговый сценарий исследования ниши, болей клиентов и слабых мест конкурентов через ИИ.',file:'19rBzo9dHKUdAlEZjt8XGwiJME22HG9Mf'},
    {title:'Банк промптов «Контент-завод: 30 шаблонов вирусных постов и рилс»',description:'Готовые структуры сценариев и текстов для соцсетей: от кликбейтного хука до продажи через кейс.',file:'1qfKlrIbBCzYhimNXUbuQ4G7v8pBAG-wE'},
    {title:'30 идей первого проекта на вайб-кодинге',description:'Шесть направлений, в которых новичок может быстро собрать заметный и полезный результат.',file:'184mDwcx8AYSvXSLxhlu9hx8RqEm37SRX'},
    {title:'20 проектов для себя, семьи, работы или на продажу',description:'Не абстрактные направления, а конкретные проекты, которые можно показать и использовать.',file:'11oXsWmA8XTsLCZGyAge4ysozDALyaglp'}
  ]},
  {label:'ТРЕТЬЯ ПРОКРУТКА',prizes:[
    {title:'Шпаргалка «Топ-15 фатальных ошибок в общении с нейросетями»',description:'Практический гайд для работы с ChatGPT, Claude, GigaChat, Qwen и другими ИИ-моделями.',file:'1r_-6_4JEWF4PNWrSEmPlS9vEx8NaalHy'},
    {title:'Матрица делегирования: 20 рутинных задач бизнеса, которые забирает агент',description:'Готовый аудит задач — от парсинга отзывов до первичной сортировки заявок — которые можно сразу передать роботу.',file:'1ymbAeg9MIGCjqCIWTdaomRJ1RFk-puN0'},
    {title:'Конструктор промптов: как объяснить ИИ, что вы хотите создать',description:'Формула запроса, которая превращает мысль «хочу что-то сделать» в понятное техническое задание для ИИ.',file:'1ZdRTMnMKbaGnZKk5oba_xSBub0a95c8l'},
    {title:'Чек-лист безопасного цифрового проекта',description:'Проверка, которая помогает не потерять доступы, данные, деньги и доверие пользователей.',file:'1FfuwhgfAgjZUxXBMPDhl0vrKNrdE9nhx'}
  ]}
];

const colors=['#6548e8','#967cf8','#4934ad','#c8bbff'];
const requestedRound=Number(new URLSearchParams(location.search).get('round'))-1;
const lockedRound=Number.isInteger(requestedRound)&&requestedRound>=0&&requestedRound<rounds.length?requestedRound:null;
const wheel=document.querySelector('#wheel'),spin=document.querySelector('#spin'),result=document.querySelector('#result'),description=document.querySelector('#description'),message=document.querySelector('#message'),overline=document.querySelector('#overline'),icon=document.querySelector('#resultIcon'),download=document.querySelector('#download'),list=document.querySelector('#prizes'),roundLabel=document.querySelector('#roundLabel'),roundButtons=[...document.querySelectorAll('[data-round]')];
let round=0,rotation=0,busy=false;

function storageKey(){return `prize-wheel-16-09-2026-round-${round}`;}
function downloadUrl(file){return `https://drive.google.com/uc?export=download&id=${file}`;}
function randomIndex(){const values=new Uint32Array(1);crypto.getRandomValues(values);return values[0]%4;}

function drawWheel(){
  const data=rounds[round];
  roundLabel.textContent='✦ '+data.label;
  wheel.replaceChildren();
  wheel.style.background=`conic-gradient(${colors.map((color,index)=>`${color} ${index*25}% ${(index+1)*25}%`).join(',')})`;
  data.prizes.forEach((prize,index)=>{const angle=(index+.5)*90,label=document.createElement('span');label.textContent=String(index+1);label.style.transform=`translate(-50%,-50%) rotate(${angle}deg) translateY(-34cqw) rotate(${-angle}deg)`;wheel.appendChild(label);});
  list.replaceChildren();
  const heading=document.createElement('p');heading.textContent='В ЭТОЙ ПРОКРУТКЕ';list.appendChild(heading);
  data.prizes.forEach((prize,index)=>{const row=document.createElement('div');row.className='prize';row.innerHTML=`<i style="background:${colors[index]}">${index+1}</i><b>${prize.title}</b>`;list.appendChild(row);});
}

function showReady(){
  icon.textContent='🎁';overline.textContent='ОДНА ПОПЫТКА • ОДИН ПОДАРОК';result.textContent='Нажмите кнопку — и колесо выберет ваш подарок';description.textContent='';message.textContent='';spin.disabled=false;spin.hidden=false;spin.classList.remove('busy');spin.innerHTML='<span>↻</span> Крутить колесо';download.hidden=true;
}

function showResult(index,restored=false){
  const prize=rounds[round].prizes[index];
  icon.textContent='🏆';overline.textContent='ВАШ ПОДАРОК';result.textContent=prize.title;description.textContent=prize.description;message.textContent='';spin.hidden=true;download.href=downloadUrl(prize.file);download.hidden=false;
}

function selectRound(next){
  if(busy)return;
  round=next;roundButtons.forEach((button,index)=>button.classList.toggle('active',index===round));rotation=0;wheel.style.transition='none';wheel.style.transform='rotate(0deg)';requestAnimationFrame(()=>wheel.style.transition='transform 4s cubic-bezier(.12,.75,.18,1)');drawWheel();
  const saved=localStorage.getItem(storageKey());saved===null?showReady():showResult(Number(saved),true);
}

roundButtons.forEach(button=>button.addEventListener('click',()=>{if(lockedRound===null)selectRound(Number(button.dataset.round));}));
spin.addEventListener('click',()=>{
  if(busy||localStorage.getItem(storageKey())!==null)return;
  busy=true;spin.disabled=true;spin.classList.add('busy');spin.innerHTML='<span>↻</span> Колесо вращается…';message.textContent='Определяем ваш подарок…';
  const index=randomIndex(),target=360-(index+.5)*90;rotation=Math.ceil(rotation/360)*360+1440+target;wheel.style.transform=`rotate(${rotation}deg)`;
  setTimeout(()=>{localStorage.setItem(storageKey(),String(index));busy=false;showResult(index);},4000);
});

if(lockedRound!==null)document.body.classList.add('single-round');
selectRound(lockedRound??0);
