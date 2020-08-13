const changeClass = (el,cls,cl) =>
{
  if(!el.getAttribute("class")) el.setAttribute("class","");
  el.setAttribute("class",el
  .getAttribute("class")
  .split(" ")
  .filter(x=>!cls.includes(x))
  .concat(cl)
  .join(" ")
  .trim());
}
const addClass = (el,cl) => changeClass(el,[],cl);
const removeClass = (el,cl) => changeClass(el,[cl]);
const removeClassList = (el,cls) => changeClass(el,cls);
const flashClass = (el,cl) =>
{
  addClass(el,cl);
  window.setTimeout(removeClass,200,el,cl);
}
const changeLabel = (el,lbl) => el.children[0].innerHTML = lbl;
const removeLabel = (el) => changeLabel(el,"");

const dice = (bottom,top,profile) =>
{
  switch (profile) {
    case "high":
      return top - Math.round(Math.random() * Math.random() * (top-bottom));
    case "low":
      return bottom + Math.round(Math.random() * Math.random() * (top-bottom));
    case "flat":
    default:
      return bottom + Math.round(Math.random() * (top-bottom));

  }
}

const kick = (els, el) => (els.indexOf(el)!==-1)?els.splice(els.indexOf(el),1):[];

const updateHTML = (label, value) =>
{
  if (document.getElementById(label).tagName==="INPUT") document.getElementById(label).value=value;
  else document.getElementById(label).innerHTML=value;
}
