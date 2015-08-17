var notification = function(msg)
{
	new Fx.Tween($('msgA'), {property: 'opacity', duration: 3, transition: Fx.Transitions.Quart.easeInOut}).start(1,0);
	new Fx.Tween($('msgB'), {property: 'opacity', duration: 3, transition: Fx.Transitions.Quart.easeInOut}).start(1,0);
	
	if($('msgA').get('sel') == 1 && $('msgB').get('sel') == 0)	{	a = $('msgA');	b = $('msgB');	} 
	else {	a = $('msgB');	b = $('msgA');	}
			
		b.setStyle('z-index', 0);	a.setStyle('z-index', -1);
		b.set('html', msg);			b.fade(1);	a.fade(0);
		
		b.set('sel', 1);			a.set('sel', 0);
};