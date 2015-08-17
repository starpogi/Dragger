var reservationForm = new Class({
								
	Implements: Options,
	
	Extends: timeSelection,
	
	containerReference: 'resForm',
	
	options:
	{
		blank: ''
	},
	
	initialize: function(options)
	{
		this.setOptions(options);	
	}
});

	//	Functions
		function capitalizeWords(words) { 
			// Original Code from Carlos Gallupa (http://www.mximize.com)
			// Modified to capitalize all words by Javier T. Onglao
			
			 var str = words.split(" ");
			 
			 var sentence = "";
			 
			 for(i = 0; i < str.length; i++)
			 {
				str[i] = str[i].substring(0,1).toUpperCase() + str[i].substring(1,str[i].length).toLowerCase(); 
				sentence = sentence + " " + str[i];
			 }
			 
			 return sentence; 
		} 
		
		function gethelptext(el)
		{
			// (e.g.) Formatter. Format special help text identifiers appropriately
			var spliceEG = el.get('helptext').split('(e.g.');
			var specialUpper = el.get('helptext').split('specialCaps:|');
			if(spliceEG[1] || specialUpper[1])
			{
				if(!specialUpper[1])
					return spliceEG[0] + "<br/><i> (e.g." + spliceEG[1] + "</i>";
				else if(!spliceEG[1])
					return specialUpper[0] + "<br/><span style=\"text-transform:uppercase;font-size:10px\">" + specialUpper[1].replace('|', '') + "</span>";
			}
			else
				return el.get('helptext');	
		}
		
	//	String Implements
		String.implement({
			// Sanitize Phone Number 
			// From Web Monkeys
			format_phone: function() {
				var newphone = this.replace(/[^\d]/g, "");
				var phonematches = newphone.match(/^(\d{0,3})(\d{0,3})(\d{0,4})/);
				if (phonematches[1].length > 0)
				{
					newphone = "(" + phonematches[1];
				}
				if (phonematches[1].length == 3)
				{
				  newphone += ") " + phonematches[2];
				  if (phonematches[2].length == 3)
				  {
					newphone += "-" + phonematches[3];
				  }
				}
				return newphone;
			},
			
			//Remove Whitespace
			clean: function() {
				var strClean = this;
				strClean=strClean.clean();
				return strClean;
			}
		});