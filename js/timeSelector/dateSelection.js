var dateSelection = new Class({
	
	Implements: [Options],
	
	Extends: timeGUI,
	
   CLIENT_ID: '43350135427-1mvfsm05001e2a8v9eb9o2vuvdctng5v.apps.googleusercontent.com',
   SCOPES: ['https://www.googleapis.com/auth/calendar.readonly'],
   API_KEY: 'AIzaSyCw1tTqkkVyb8OMbcUO2RsGDzOkODKbqJw',
   
	options:
	{
      // Calendar IDs
		places: [
         ['BU Beach', 'tpemf5f4hg8q5nv5t3tki7proc@group.calendar.google.com'],
         ['Marsh Chapel Kitchen', 'rue7t103ma07i6j3u1vfpbjfvo@group.calendar.google.com']
      ]
	},
	
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
		
		this.places = this.options.places;
      
      gapi.client.setApiKey(this.API_KEY);
      this.checkAuth();
      
      $('authorize-button').addEvent('click', function(event) {
         this.handleAuthClick(event)
      }.bind(this));
	},
   
   checkAuth: function() 
   {
      /*
         CHECK AUTH
         
         Check if this app is authorized to make API calls to Google Calendar.
      
      */
      
      gapi.auth.authorize(
          {
            'client_id': this.CLIENT_ID,
            'scope': this.SCOPES,
            'immediate': true
          }, this.handleAuthResult
      );
   },
   
   handleAuthResult: function(authResult)
   {
      /*
         HANDLE AUTH RESULT
         
         Handles response from the checkAuth function
      */
      var authorizeDiv = document.getElementById('authorize-div');
      
      if(authResult && !authResult.error) 
      {
         authorizeDiv.style.display = 'none';
         gapi.client.load('calendar', 'v3', function() {
            window.fireEvent('auth_success');
         });
      } 
      else 
      {
         authorizeDiv.style.display = 'inline';
         window.fireEvent('auth_failed');
      }
   },
   
   handleAuthClick: function(event) {
      /*
         HANDLE AUTH RESULT EVENT
         
         Authorizes to auth from user.
      */
      gapi.auth.authorize(
         {
            client_id: this.CLIENT_ID, 
            scope: this.SCOPES, 
            immediate: false
         },
         this.handleAuthResult);
      return false;
   },
 
	loadTaken: function(date, area, noload)
	{	
		/*
		*	LOAD TAKEN
		*	private class
		*	
		*	This function requests database data from the provided phpProcessFile variable. Upon requesting, the whole GUI is blocked to prevent unnecessary server load. When the script finishes (regardless of success), the array this.taken is modified via JSON-PHP connection, and the limitations are loaded.
      *  Uses V3 API, oAuth2 authentication
		*	
		*	@input: date, area
		*	@output: none
		*	@version: 2
		*	@author: Javier Onglao
		*/
		$(this.loaderReference).fade(0.8);
		$(this.loaderTextReference).fade(1);
      
      var date = new Date().parse(date);
      var calendarId = this.places[area][1];
      
      var request = gapi.client.calendar.events.list({
          'calendarId': calendarId,
          'timeMin': date.toISOString(),
          'showDeleted': false,
          'singleEvents': true,
          'maxResults': 10,
          'orderBy': 'startTime'
      });
      
      
      request.execute(function(resp) {
         var events = resp.items;
         
         emptyArray();
         
         if (events.length > 0) 
         {
            for (i = 0; i < events.length; i++) 
            {
               var event = events[i];
               
               if (!event.start.dateTime) {
                  startTime = event.start.date;
               }
               
               var start = splitParts(new Date().parse(event.start.dateTime));
               var end = splitParts(new Date().parse(event.end.dateTime));
               
               // TODO: Fix this piece of shit. Should just be an object instead of this retarded string.
               // Also, should support non :00, :30 minutes. To be more abstract.
               var dateString = start.hr + ((start.min == 30) ? ".5" : ".0" ) + 
               " - " + end.hr + ((end.min == 30) ? ".5" : ".0" );
               addToArray(dateString);
            }
         }
         
     }.bind(this));
     
     var splitParts = function(dateObj)
     {
         // Splits the datetime into hr, min components
         return {
            'hr': dateObj.format('%H'),
            'min': dateObj.format('%M')
         };
         
     }.bind(this);
		
		var addToArray = function(element)
		{
			this.taken.extend([element]);
			this.generateTakenRegions(this.takenReference);
			
			$(this.loaderReference).fade(0);
			$(this.loaderTextReference).fade(0);
		}.bind(this);
		
		var emptyArray = function()
		{
			this.taken = [];
			this.generateTakenRegions(this.takenReference);
			
			$(this.loaderReference).fade(0);
			$(this.loaderTextReference).fade(0);
		}.bind(this);
	},
	
	generateTakenRegions: function(element)
	{	
		/*
			GENERATE TAKEN REGIONS
			private class
			
			This function generates the HTML elements that enhance the graphical user interface experience of the user. These "taken" bars tell the user that certain time slots have already been booked.
			
			@input: element
			@output: none
			@version: 1
			@author: Javier Onglao
		*/
		
		// Empty All Contents
		$(element).set('html', '');
		
		// Cycle through every this.taken array member
		this.taken.each(function(range, index) {
			var times = range.split('-');
		
			new Element('div', {id: 'taken' + index}).inject(element);
				$('taken' + index).addClass('takenBar');
				$('taken' + index).setStyle('left', (times[0].toFloat() - this.options.begins.toFloat()) * this.pylonDistance);
				$('taken' + index).setStyle('width', (times[1].toFloat() - times[0].toFloat()) * this.pylonDistance);
		}.bind(this));	
	},
});