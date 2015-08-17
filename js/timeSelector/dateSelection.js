var dateSelection = new Class({
	
	Implements: [Options],
	
	Extends: timeGUI,
	
   CLIENT_ID: '43350135427-1mvfsm05001e2a8v9eb9o2vuvdctng5v.apps.googleusercontent.com',
   SCOPES: ['https://www.googleapis.com/auth/calendar.readonly'],
   API_KEY: 'dragger-1040',
   
	options:
	{
      // Calendar IDs
		places: [
         ['BU Beach', 'tpemf5f4hg8q5nv5t3tki7proc%40group.calendar.google.com/public'],
         ['Marsh Chapel Kitchen', 'rue7t103ma07i6j3u1vfpbjfvo%40group.calendar.google.com/private-03ed8f57591a588883cfa349d8cef786']
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
   
   fireAuth: function()
   {
      console.log('asd');
      window.fireEvent('auth_success');
   },
   
   handleAuthResult: function(authResult)
   {
      /*
         HANDLE AUTH RESULT
         
         Handles response from the checkAuth function
      */
      var authorizeDiv = document.getElementById('authorize-div');
      
      if (authResult && !authResult.error) 
      {
         authorizeDiv.style.display = 'none';
         gapi.client.load('calendar', 'v3', this.fireAuth)
         window.fireEvent('auth_success');
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
      
		date = new Date().parse(date);
      console.log(area);
		console.log(this.places);
      
      var request = gapi.client.calendar.events.list({
          'calendarId': this.places(area),
          'timeMin': date.toISOString(),
          'showDeleted': false,
          'singleEvents': true,
          'maxResults': 10,
          'orderBy': 'startTime'
      }.bind(this));
      
      request.execute(function(resp) {
          var events = resp.items;
          console.log('Upcoming events:');

          if (events.length > 0) {
            for (i = 0; i < events.length; i++) {
              var event = events[i];
              var when = event.start.dateTime;
              if (!when) {
                when = event.start.date;
              }
              console.log(event.summary + ' (' + when + ')');
            }
          } else {
            console.log('No upcoming events found.');
          }

        });
      
		// var service = new google.gdata.calendar.CalendarService('gdata-marsh-chapel');
      // console.log('http://www.google.com/calendar/feeds/' + this.places[area][1] +'/full');
		// var query = new google.gdata.calendar.CalendarEventQuery('http://www.google.com/calendar/feeds/' + this.places[area][1] +'/full');
		
		// query.setOrderBy('starttime');
		// query.setSortOrder('ascending');
		// query.setMinimumStartTime(date+'T09:00:00.000-05:00');
		// query.setMaximumStartTime(date+'T22:00:00.000-05:00');
		// query.setSingleEvents(true);
		
		// service.getEventsFeed(query, listTaken, handleError);
		
		// function listTaken(feedRoot)
		// {
			// emptyArray();
			// var entries = feedRoot.feed.getEntries();
			
			// var z = '';
			
			// var len = entries.length;
			  // for (var i = 0; i < len; i++) {
				// var entry = entries[i];
				// var title = entry.getTitle().getText();
				// var endJSTime = null;
				// var startJSTime = null;
				// var times = entry.getTimes();
				// if (times.length > 0) {
				  // startJSTime = times[0].getStartTime().getDate();
				  // endJSTime = times[0].getEndTime().getDate();
				// }
				
				// var dateString = ''
				// if (!times[0].getStartTime().isDateOnly()) {
				  // dateString += " " + startJSTime.getHours()  + 
					  // ((startJSTime.getMinutes() == 30) ? ".5" : ".0" ) + " - " + endJSTime.getHours() + ((endJSTime.getMinutes() == 30) ? ".5" : ".0" );
					  
					// addToArray(dateString);
				// }
			  // }
			// if(len == 0)
			// {	emptyArray();	}
		// }
		
		// function handleError(e)
		// {
			// console.log(e);
		// }
		
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