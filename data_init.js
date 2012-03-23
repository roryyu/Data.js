function setData(){
	var el=document.getElementById('target')
	Data.data(el,'key',function(){alert('set successful')})
	
}
function getData(){
	var el=document.getElementById('target')
	var dd=Data(el);
	console.log(dd.data('options'))
	Data.data(el).fn.call(this)
}