var begins;
var ends;
var modes;

var timeGUI = new Class({
	
	Implements: [Options],
	
	taken: [],						// Determine which time slots are already taken.
	
	pylonDistance: 0,
	
	// All the CSS class/id names. When changing CSS class or id names, please change the variables below accordingly.
	notificationReference: "notification",
	msgAReference: "msgA",
	msgBReference: "msgB",
	
	draggableHolderReference: "draggableHolder",
	draggableReference: "draggable",
	
	containerReference: "container",
	timeChooserReference: "timeChooser",
	takenReference: "takenRegion",
	selectorRegionReference: "selectorRegion",
	pylonsReference: "pylons",
	guiHolderReference: "gui",
	guiReference: "referenceBar",		// Name of the selection bar that will aid users visually.
	
	loaderReference: "loadingScreen",
	loaderTextReference: "loadingScreenText",
	
	timeLabelReference: "timeLabel",
	
	timeOutputFieldReference: "timeOutputField",
	dateOutputFieldReference: "dateOutputField",
	areaOutputFieldReference: "areaOutputField",
	
	dateDisplayReference: 'dateDisplay',
	
	selectorStartReference: 'selectorStart',
	selectorReference: 'selector',
	selectorEndReference: 'selectorEnd',
	
	minorPylonReference: 'minorPylon',
	majorPylonReference: 'majorPylon',
	
	options: {
		begins: 0,
		ends: 0,
		elementId: '',
		modes: [],
		timeOutputFieldName: '',
		dateOutputFieldName: '',
		areaOutputFieldName: '',
		loaderMessage: ''
	},
	
	initialize: function(options)
	{
		this.setOptions(options);
		
		this.elementId = this.options.elementId;
		this.timeOutputFieldName = this.options.timeOutputFieldName;
		this.dateOutputFieldName = this.options.dateOutputFieldName;
		this.areaOutputFieldName = this.options.areaOutputFieldName;
		this.loaderMessage = this.options.loaderMessage;
		this.modes = this.options.modes;
	},
	
	construct: function()
	{	
		// Container
		//		contains everything
		new Element('div', {id: this.containerReference}).inject(this.elementId);
		
		// Notification
		//		provides natural language instructions to the user.
		new Element('div', {id: this.notificationReference}).inject(this.containerReference);
			new Element('div', {id: this.msgAReference}).inject(this.notificationReference);
			new Element('div', {id: this.msgBReference}).inject(this.notificationReference);
	
		// Time Chooser
		// 		provides the graphical user interface (the one with the lines)
		new Element('div', {id: this.timeChooserReference}).inject(this.containerReference);
			new Element('div', {id: this.selectorRegionReference}).inject(this.containerReference, 'top');
				this.generateSelectorRegions(this.selectorRegionReference);
			new Element('div', {id: this.guiHolderReference}).inject(this.timeChooserReference);
				new Element('div', {id: this.guiReference}).inject(this.guiHolderReference);
			new Element('div', {id: this.takenReference}).inject(this.timeChooserReference);
			new Element('div', {id: this.pylonsReference}).inject(this.timeChooserReference);
				this.generatePylons(this.pylonsReference);
				
		// Dragger
		//		allows the user to drag this
		new Element('div', {id: this.draggableReference}).inject(this.selectorRegionReference);
				
		// Time Label
		// 		provides the numbers (e.g. 9 AM, 10 AM)
		new Element('div', {id: this.timeLabelReference}).inject(this.containerReference);
			this.generateTimeLabels(this.timeLabelReference);			
			
		// Output Field
		//		for processing with PHP, this hidden field will store all the time range as x:yy PM - z:ww AM, date as xx/yy/zzzz, and area as id.
		for(var z = 0; z < this.modes.length; z++)
		{
			new Element('input', {type: 'hidden', id: this.modes[z] + this.timeOutputFieldReference, name: this.modes[z] + this.timeOutputFieldName}).inject(this.containerReference);
			new Element('input', {type: 'hidden', id: this.modes[z] + this.dateOutputFieldReference, name: this.modes[z] + this.dateOutputFieldName}).inject(this.containerReference);
			new Element('input', {type: 'hidden', id: this.modes[z] + this.areaOutputFieldReference, name: this.modes[z] + this.areaOutputFieldName}).inject(this.containerReference);
		}
		
		// Loaders
		//		for GUI experience. 
		new Element('div', {id: this.loaderReference}).inject(this.containerReference);
			new Element('div', {id:  this.loaderTextReference}).inject( this.loaderReference);
			
		// when done constructing, start tweaking
		this.tweak();
	},
	
	tweak: function()
	{
		/*
			Tweaks the elements by adding styles, text, etc.
		*/
		
		// Time Chooser Width
		//	After constructing everything, we should modify the width so that the selection bar won't just float around in free air.
		$(this.timeChooserReference).setStyle('width', (($(this.options.begins+'M').getStyle('margin-right').toFloat() + 1) * (2 * (this.options.ends - this.options.begins))) + 1);
		
		// Taken Region
		//	After constructing everything, we should modify the width so that the selection bar won't just float around in free air.
		$(this.takenReference).setStyle('width', (($(this.options.begins+'M').getStyle('margin-right').toFloat() + 1) * (2 * (this.options.ends - this.options.begins))) + 1);
		
		// Selector Region
		//	After constructing everything, we should modify the width so that the selection bar won't just float around in free air.
		$(this.selectorRegionReference).setStyle('width', ($(this.options.begins+'').getStyle('width').toFloat() + $(this.options.begins+'').getStyle('margin-right').toFloat() + 1) * (2 * (this.options.ends - this.options.begins)));
		
		// Loaders
		//		for GUI experience. 
		$(this.loaderTextReference).set('html', this.loaderMessage);
			
		// Each element is loaded, then faded out using Fx.Tween to provide smooth fade in transitions when needed.
		new Fx.Tween($(this.loaderReference), {property: 'opacity', duration: 1, transition: Fx.Transitions.Quart.easeInOut}).start(1,0);
		new Fx.Tween($(this.loaderTextReference), {property: 'opacity', duration: 1, transition: Fx.Transitions.Quart.easeInOut}).start(1,0);
		
	},
	
	generateSelectorRegions: function(element)
	{
		var i = this.options.begins;
		while(i <= this.options.ends)
		{
			new Element('div', {id: i + ''}).inject(element);
			if(i == this.options.begins)	{	$(i + '').addClass(this.selectorStartReference);	}
			else							{	$(i + '').addClass(this.selectorReference);		}
			
			i = i + 0.5;
		}
	},
	
	generatePylons: function(element)
	{
		for(var i = this.options.begins; i <= this.options.ends; i++)
		{
			last = (i == this.options.ends) ? "Last" : "";
			
			if($type($(i + '')))
			{
				new Element('div', {id: i + 'M', hour: i}).inject(element);
					$(i + 'M').addClass(this.majorPylonReference + last);
			}
			if($type($((i + 0.5) + '')))
			{
				new Element('div', {id: i + 'm', hour: i}).inject(element);
					$(i + 'm').addClass(this.minorPylonReference + last);
			}
		}
	},
	
	generateTimeLabels: function(element)
	{
		for(var i = this.options.begins; i <= this.options.ends; i++)
		{
			last = (i == this.options.ends) ? "Last" : "";
			
			if($type($(i + '')))
			{
				new Element('div', {id: i + 'tl'}).inject(element);
					$(i + 'tl').addClass(this.timeLabelReference);
					$(i + 'tl').set('html', this.militaryToStandardTime(i) + "<dd>" + this.pmamTime(i) + "</dd>");
			}
		}
	},
	
	militaryToStandardTime: function(time)
	{
		// Converts military time to standard time
		// 	Output: string
		return (time > 12) ? (time - 12) : time;
	},
	
	pmamTime: function(time)
	{
		// Converts military time to standard time
		// 	Output: string
		return (time >= 12) ? "PM" : "AM";
	},
	
	getValue: function(what)
	{
		return this.options.begins;
	}
});