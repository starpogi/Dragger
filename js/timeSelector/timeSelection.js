var timeSelection = new Class({
    
	Implements: [Options],
	
	Extends: dateSelection,
    
   starting: 0,						// Reference for the user-selected starting time.
   ending: 0,							// Reference for the user-selected ending time.
	
	startCoord: 0,						// Starting Coordinates define the anchor point
	
	selectionBoolean: [],				// Determines if any of the selected times land on areas that are already reserved. Changes to false if the user selects a region that is taken already.
	
	hasMorphed: false,
	
	thisArea: 0,
   auth_success: false,
   
   options:
   {    
      begins: 0,
      ends: 0,
      modes: [],
      introduction: '',
      whileSelectingMessage: '',
      afterSelectingMessage: '',
      errorSame: '',
      errorTaken: '',
      errorMessageShiftDelay: 1.5				// Time (in seconds) before the error message shifts back to the default introduction message
   },
    
	/* Initializer Function */
    initialize: function(options)
    {
		/*
			_INITIALIZE
			class function
			
			This function is called upon when the class is initialized via the new Class call. Initializes all variables from the options (defined also by the administrator in the class configuration) into the local scope of the class. This also inherits variables from its parent class, timeGUI.
			
			@input: options, parent options (timeGUI)
			@output: none
			@version: 1
			@author: Javier Onglao
		*/
		
		// Load all options (even from the inherited class of timeGUI)
      this.setOptions(options);
		this.parent(options);
		
		// Define all selectable regions (e.g. areas above (in terms of z-index) the lines that are clickable)
		this.elements = $$('div[class^=selector]');
		
		// Sets current mode
		this.mode = (!this.mode) ? this.options.modes[0] : this.mode;
		this.modes = this.options.modes;
		
		// Welcome the (message) options into the class variable scope
		this.introduction = this.options.introduction;
		this.whileSelectingMessage = this.options.whileSelectingMessage;
		this.afterSelectingMessage = this.options.afterSelectingMessage;
		
		// Error Messages
		this.errorSame = this.options.errorSame;
		this.errorTaken = this.options.errorTaken;
		
		// Delay time
		this.errorMessageShiftDelay = this.options.errorMessageShiftDelay;
		
		// Set default message as the introduction
		this.message = this.options.introduction;
		
		// Set starting time (so as not to resort to 0:00 AM)
		this.starting = this.options.begins;
		
		// Determine the distance between pylons using one example (the first pylon). Pylons are these lines you see on the graphical user interface.
		// Pylon Distance is twice the margin-right of the element, plus 2 (for the 1px lines of each pylon)
		this.pylonDistance = ($(this.options.begins+'M').getStyle('margin-right').toInt() * 2) + 2;
		
		// Initializes the Drag.Move Class
		//	developed by mootools (packaged under moo.more)
		var dragger = new Drag.Move($(this.draggableReference), {
				grid: this.pylonDistance / 2,
				container: this.selectorRegionReference,
				droppables: '.'+this.selectorReference,
				
				onStart: function() { this.startDrag(); }.bind(this),
				onDrag: function(e) { this.determineTime(e); }.bind(this),
				onComplete: function() { this.endDrag(); }.bind(this)
		});
		
		// Event Panel Modes
		$('primary').setStyle('background', '#ccc');
		this.options.modes.each(function(e, s) { $(e).addEvent('click', function() { this.changeMode(s); }.bind(this))}.bind(this) );
		
		$('dressCancel').addEvent('click', function() {
				$('primary').setStyle('background', '#CCCCCC');
				$('dress').setStyle('background', '#ffffff');
				$('dressElements').setStyle('display', 'none');
				$('primaryElements').setStyle('display', 'block');
				
				$('dresstimeOutputField').set('value', '');
				$('dressdateOutputField').set('value', '');
				$('dressareaOutputField').set('value', '');	
				
				$('dressPlace').set('html', '');
				$('dressTime').set('html', '');
				$('dressDate').set('html', '');
				
				$('dressCancel').set('html', '');
				$('dressModeName').tween('height', 55);
				$('primaryModeName').tween('height', 55);
				//$('subEvent').tween('height', 273);
		}.bind(this));
      
      window.addEvent('auth_success', function() {
         this.auth_success = true;
         this.loadState(this.mode);
      }.bind(this));
      
      window.addEvent('auth_failed', function() {
         this.auth_success = false;
      }.bind(this));
    },
    
   /* Direct Start Function */
   start: function(source)
    {
		/*
			START
			private function
			
			 EDIT!!!!!!
			Initializes, and resets all local class scope variables. This function must be called upon as one would call a prototype function (timervariable.start()) for the whole class to begin. This function inherits important variables from timeGUI class such as beginning time, and ending time. The previously-mentioned variables allow for the construction of the interface, as well as determining the width and location of the user selection region.
			
			@input: none
			@output: none
			@version: 1
			@author: Javier Onglao
		*/
		
		// If the message is other than the introduction, let it stand there for some time, then shift to the introduction message. This way, the user won't get lost.
		// Source determines where the function was called. If it was called from buttons (e.g. Try this Date), then the previous messages (error) need not be shown.
        if(this.message != this.introduction && source != "button")
		{
			notification(this.message);
			(function() {	notification(this.introduction);	}.bind(this)).delay(this.errorMessageShiftDelay * 1000);
		}
		else	{	notification(this.message);		}
		
		// Attach positionDragger function to all selectable regions. Allows all regions to be selectable.
        this.elements.addEvent('mouseenter', function(e) 
        { 
            this.positionDragger(e.target); 
        }.bind(this));
    },
	
	/* Primary Functions */
	
	startDrag: function()
	{	
		this.restartVariables();
		
		$(this.mode + 'Place').set('html', this.places[this.thisArea][0]);
		$(this.mode + 'Date').set('html', $('userDate').get('value'));
		this.elements.removeEvents('mouseenter');
		notification(this.introduction);
      
		$('dressModeName').tween('height', 110);
      $('primaryModeName').tween('height', 110);
	},
    
    determineTime: function(element)
    {	
		previousCoords = element.getPosition(this.selectorRegionReference).x - 3;
		
		this.ending = (previousCoords / this.pylonDistance) + this.options.begins;
		
		this.parseTimeRange(this.starting, this.ending, this.whileSelectingMessage);
		
		var hourDistance = this.ending - this.starting;
		
		if(hourDistance > 0)	// This means that we are going to the right
		{
			$(this.guiReference).setStyle('float', 'left');
			$(this.guiReference).setStyle('margin-right', 0);
			$(this.guiReference).setStyle('margin-left', (this.starting - this.options.begins) * this.pylonDistance);
		}
		else					// But if we are going to the left, the difference becomes negative
		{						// So we change the direction
			$(this.guiReference).setStyle('float', 'right');
			$(this.guiReference).setStyle('margin-left', 0);
			$(this.guiReference).setStyle('margin-right', (this.options.ends - this.starting) * this.pylonDistance);
		}
		
		$(this.guiReference).setStyle('width', Math.abs(hourDistance) * this.pylonDistance); 
		
      this.elements.removeEvents('click');
      
		this.elements.addEvent('click', function(e)
		{
			this.endTime(e.target);
		}.bind(this));
    },
    
    endDrag: function(element)
    {	
		var error = false;
		
		// Make sure the user gets the right message!
		if(this.starting.toFloat() == this.ending.toFloat())
		{	this.message =  this.errorSame;	error = true;	}
		else if(this.checkTaken().contains(false))
		{	this.message = this.errorTaken;	error = true;	}
		
		this.elements.removeEvents('click');
		this.elements.removeEvents('mouseenter');
		
        if(error)
		{
			// If the user selects the same ending and starting time OR selects a time slot that is already taken, then bring him back to the start!	'
			this.starting = this.options.begins;
			this.restartVariables();
			this.start('function');
		}
		else
		{
			this.parseTimeRange(this.starting, this.ending, this.afterSelectingMessage);
			
			$(this.mode + 'timeOutputField').set('value', this.displayTime(this.starting, this.ending, 'string'));
			$(this.mode + 'dateOutputField').set('value', this.thisDate);
			$(this.mode + 'areaOutputField').set('value', this.thisArea);
		
			$(this.mode + 'Time').set('html', this.displayTime(this.starting, this.ending, 'string'));
			
			if(this.mode == "dress") { new Element('a', {id: 'dressCancel'}).inject('dressModeInfo'); $('dressCancel').set('html', 'Discard'); }
			
			// Attach positionDragger function to all selectable regions. Allows all regions to be selectable.
			this.elements.addEvent('mouseenter', function(e) 
			{ 
				this.positionDragger(e.target); 
			}.bind(this));
		}
    },
	
	/* Auxiliary Functions */
	
	checkTaken: function()
	{		
		start = this.starting.toFloat();
		end = this.ending.toFloat();
		
		// Interchanges start time and end time if start time is greater than end time. Of course, we need to be sensible around here.
		if(start > end) { start = this.ending.toFloat(); end = this.starting.toFloat();	}
		
		this.taken.each(function(range, index) {
			var times = range.split('-');
			
			var takenBegins = times[0].toFloat();
			var takenEnds = times[1].toFloat();
		
			if((start > takenBegins && start < takenEnds) || 
				(start == takenBegins && start < takenEnds) ||  
				(end > takenBegins && end < takenEnds) || 
				(end > takenBegins && end == takenEnds) || 
				(start < takenBegins && end > takenEnds) || 
				(end == takenBegins && start == takenEnds))
			{	this.selectionBoolean.extend([false]);	}
			else
			{	this.selectionBoolean.extend([true]);	}
			
		}.bind(this));	
			
		return this.selectionBoolean;
	},
	
	convertTime: function(time, type)
	{
		// type: human readable (e.g. 9:30 PM), or syntax (e.g. 9.50)
		// Converts the decimal values to actual units of time. Example: 9.50 becomes 9:30 AM.
		// 	Output: string
		if(type == 'syntax')
		{
			time = time ;
			ampm = time.split(" ");
			data = ampm[0].split(":");
			output = ((ampm[1] == "PM") ? (data[0].toInt() + 12) + '' : data[0]) + ((data[1] == "30") ? ".5" : ".0");
		}
		else
		{
			if(time.toInt() == time) {	lastPart = ':00'; 						}
			else 					 {	lastPart = ':30';	time = time - 0.5;	}
			
			if(time > 12) { output = (time - 12) + lastPart + ' PM'; }
			else if(time == 12) { output = time + lastPart + ' PM';	 }
			else { output = time + lastPart + ' AM';                 }
		}
		return output;
	},
	
	displayTime: function(start, end, mode)
	{
		// modes: array, or string
		// type: standard or military
		//	Correctly displays the time. Switches the end and start times accordingly to make sure they are displayed in chronological order.
		//		Output: string
		start = start.toFloat();
		end = end.toFloat();

		if(mode == "string")
			return (start > end) ? this.convertTime(end) + " - " + this.convertTime(start) : this.convertTime(start) + " - " + this.convertTime(end);
		else if(mode == "array")
		{
			var displayData = [];
			
			if(start > end)
			{
				displayData[0] = this.convertTime(end); displayData[1] = this.convertTime(start);
			} 
			else 
			{
				displayData[0] = this.convertTime(start); displayData[1] = this.convertTime(end);
			}
			
			return displayData;
		}
	},
	
	parseTimeRange: function(starting, ending, variable)
	{
		timeDisplayData = this.displayTime(starting, ending, 'array');
		start = timeDisplayData[0];
		end = timeDisplayData[1];
		notificationAttach = ($(this.msgAReference).get('sel') == 1) ? 'msgA' : 'msgB';
        eval("$('" + notificationAttach + "').set('html', '" + variable.replace(/</gi, "' +").replace(/>/gi, "+ '") + "');");
	},
	
	restartVariables: function()
	{
		// Restart all important class-scope variables.
		this.selectionBoolean = [];
		$(this.mode + 'timeOutputField').set('value', '');
		$(this.mode + 'dateOutputField').set('value', '');
		$(this.mode + 'areaOutputField').set('value', '');
		$(this.guiReference).setStyle('width', 0);
		
		$(this.mode + 'Time').set('html', '');
	},
	
	changeParameters: function(date, area)
	{
		this.thisDate = date;
		this.thisArea = area;
		
		if($(this.mode+'dateOutputField').get('value') && $(this.mode+'areaOutputField').get('value'))
		{
			$(this.mode + 'Place').set('html', this.places[area][0]);
			$(this.mode + 'Date').set('html', $('userDate').get('value'));
		}
      
		if(this.auth_success)
         this.loadTaken(this.thisDate, this.thisArea);
         
		this.message = this.introduction;
		this.restartVariables();
		this.start('button');
	},
	
	changeMode: function(mode)
	{
		mode = this.modes[mode];
		this.mode = mode;
		msg = this.introduction;
		
		var othermode = (mode == "primary") ? "dress" : "primary";
		
		if(!$(othermode+'timeOutputField').get('value') && !$(othermode+'dateOutputField').get('value') && !$(othermode+'areaOutputField').get('value'))
		{
			$(othermode + 'Place').set('html', '');
			$(othermode + 'Date').set('html', '');
         $('dressCancel').set('html', '');
         $('dressModeName').tween('height', 90);
         $('primaryModeName').tween('height', 90);
		}
		
		$(mode).setStyle('background-color', '#CCCCCC');
		$(othermode).setStyle('background-color', '#ffffff');
		
		$(othermode+'Elements').setStyle('display', 'none');
		$(mode+'Elements').setStyle('display', 'block');
		
		$(this.guiReference).setStyle('width', 0);
		
		if($(mode+'timeOutputField').get('value')) 
		{ 
			msg = $(mode+'timeOutputField').get('value'); 
		}
		
		if($(mode+'dateOutputField').get('value') && $(mode+'areaOutputField').get('value'))
		{
			this.thisDate = $(mode+'dateOutputField').get('value');
			this.thisArea = $(mode+'areaOutputField').get('value');   
		}
			
		this.loadState(mode);
	
		notification(msg);
	},
	
	positionDragger: function(e) 
	{ 
		// Initially positions the dragger to where the user wants it to start.
		id = e.get('id');
		this.startCoord = $(id).getPosition(this.selectorRegionReference).x - 3;
		this.starting = id.toFloat();
		$(this.draggableReference).setStyle('left', this.startCoord);
		$(this.draggableReference).setStyle('top', 0);
	},
	
	loadState: function(mode)
	{
		date = $(mode + this.dateOutputFieldReference).get('value');
		area = $(mode + this.areaOutputFieldReference).get('value');
		time = $(mode + this.timeOutputFieldReference).get('value');
		
		if(time)
		{
			timeData = time.split("-");
			start = this.convertTime(timeData[0], 'syntax').toFloat();
			end = this.convertTime(timeData[1].substr(1, timeData[1].length), 'syntax').toFloat();
			$(this.guiReference).setStyle('margin-right', 0);
			$(this.guiReference).setStyle('margin-left', (start - this.options.begins) * this.pylonDistance);
			$(this.guiReference).setStyle('width', Math.abs(end - start) * this.pylonDistance); 
			this.parseTimeRange(start, end, this.afterSelectingMessage);
		}
		
		area = (!area) ? 0 : area;
		date = (!date) ? $('userDate').get('value') : date;
		
      if(this.auth_success)
         this.loadTaken(date, area);
		
		if($(mode + this.dateOutputFieldReference).get('value')) { $('userDate').set('value', date); }
		if($(mode + this.areaOutputFieldReference).get('value')) { $('userPlace').set('value', area);	}
	}
});