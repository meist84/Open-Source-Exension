
var keys = document.querySelectorAll('#calculator span');
var operators = ['+', '-', 'x', '/', '%', 'Xy'];
var decimalAdded = false;

function calculate(inp){

	var m = { add : '+'
	        , sub : '-' 
	        , div : '/'
	        , mlt : '*'
	        , mod : '%'
	        , exp : '^' };
    
   	// Create array for Order of Operation and precedence
   	m.ooo = [[ [m.mlt] , [m.div] , [m.mod] , [m.exp] ],
            [ [m.add] , [m.sub] ]];

   inp = inp.replace(/[^0-9%^*\/()\-+.]/g,'');// clean up unnecessary characters

   var output;
   for(var i=0, n=m.ooo.length; i<n; i++ ){
       
      // Regular Expression to look for operators between floating numbers or integers
      var re = new RegExp('(\\d+\\.?\\d*)([\\'+m.ooo[i].join('\\')+'])(\\d+\\.?\\d*)');
      re.lastIndex = 0; // be cautious and reset re start pos
        
      // Loop while there is still calculation for level of precedence
      while( re.test(inp) ){
         //document.write('<div>' + inp + '</div>');
         output = calc_internal(RegExp.$1,RegExp.$2,RegExp.$3);
         if (isNaN(output) || !isFinite(output)) return output;   // exit early if not a number
         inp  = inp.replace(re,output);
      }
   }

   return output;

   function calc_internal(a,op,b){
      a=a*1; b=b*1;
      switch(op){
         case m.add: return a+b; break;
         case m.sub: return a-b; break;
         case m.div: return a/b; break;
         case m.mlt: return a*b; break;
         case m.mod: return a%b; break;
         case m.exp: return Math.pow(a,b); break;
         default: null;
      }
   }
}

for(var i = 0; i < keys.length; i++){
	keys[i].onclick = function(e){
		var input = document.querySelector('.screen');
		var inputVal = input.textContent;
		var btnVal = this.textContent;
		
		if(btnVal == 'copy'){
			//waiting for webextension api copy to clipboard
			var copy = function (nmbr, mimetype){
				document.oncopy = function(event){
					event.clipboardData.setData(mimetype, nmbr);
					event.preventDefault();
				};
				document.execCommand('Copy', false, null);
			}
			//copy(input) for chrome
			copy(inputVal, 'text/plain'); 
			btnVal = '';
		}
		if(btnVal == 'C'){
			input.textContent = '';
			decimalAdded = false;
		}

		else if(btnVal == '=') {
			var equation = inputVal;
			var lastChar = equation[equation.length - 1];
			
			equation = equation.replace(/x/g, '*');

			if(lastChar == '%'){
				var operate = new RegExp("[-+*x]");
				equation = equation.replace(/%/g, '/100');
				var prefix = '';
				for(var f = 0; f < inputVal.length; f++){
					if(prefix.match(operate)){
						break;
					} else if(inputVal.charAt(f) == '%'){
						prefix = '';
						break;
					}
					prefix += inputVal.charAt(f);
				}
				equation = equation + '*' + prefix;
			} else if(lastChar != '%' && inputVal.indexOf('%') > -1){
				equation = equation.replace(/%/, '/100*');
			}

			if(operators.indexOf(lastChar) > -1 || lastChar == '.' || lastChar == '^')
				equation = equation.replace(/(^)|.$/, '');

			if(equation)
				input.textContent = calculate(equation);
				//only 13 character result limit
				if(input.textContent.length > 14){
					var n;
					var divs = document.getElementsByClassName('screen');
					for(n=0;n<divs.length;n++) {
						if(divs[n].className == 'screen'){
							divs[n].textContent = divs[n].textContent.substring(0,15);
						}
					}
					//round up
					if(!decimalAdded){
						input.textContent = calculate(equation).toPrecision(14);
					}
				}
				
			decimalAdded = false;
		}
		
		//TO DO
		//
		else if(operators.indexOf(btnVal) > -1) {
			var lastChar = inputVal[inputVal.length - 1];

			if(inputVal != '' && operators.indexOf(lastChar) == -1) 
				input.textContent += btnVal;
			
			else if(inputVal == '' && btnVal == '-') 
				input.textContent += btnVal;

			if(operators.indexOf(lastChar) > -1 && inputVal.length > 1){
				input.textContent = inputVal.replace(/.$/, btnVal);
			}

			if(inputVal != '' && btnVal == 'Xy'){
				input.textContent = inputVal.replace(/Xy/, '');
				var supTag = document.createElement('SUP');
				var expNode = document.createTextNode('^');
				supTag.setAttribute("id", "powerid");
				input.appendChild(supTag);
				supTag.appendChild(expNode);
			}

			if(inputVal.indexOf('^') > -1 ){
				input.textContent = inputVal.replace(/^$/, '');
			}

			if(inputVal.indexOf('/') > -1 && btnVal == '%'){
				input.textContent = inputVal.replace(/%/, '');
			}

			decimalAdded =false;
		}

		else if(inputVal == Number.POSITIVE_INFINITY || inputVal == Number.NEGATIVE_INFINITY){
			input.textContent = inputVal.replace(/Infinity/ig, '');
		}
		else if(inputVal === 'NaN'){
			input.textContent = inputVal.replace(/NaN/ig, '');
		}

		else if(btnVal == '.'){
			if(!decimalAdded && inputVal !='') {
				input.textContent += btnVal;
				decimalAdded = true;
			}
		}
		
		else {
			input.textContent += btnVal;
		}
		
		e.preventDefault();
	} 
}

