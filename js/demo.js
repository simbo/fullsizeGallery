

/* ------------------------------------------------------------------------ */
/*                                                                          */
/*   THIS SCRIPT IS ONLY FOR THE DEMO AND NOT NECESSARY TO USE THE PLUGIN   */
/*                                                                          */
/* ------------------------------------------------------------------------ */


$(document).ready(function(){

	$('article').each(function(){

		$(this).bind({
			'minimize'	:	function(ev){
				$(this).data('origHeight',$(this).height()).animate({
					'margin-top'	:	10,
					'width'			:	16,
					'height'		:	16
				},{
					'queue'			:	false,
					'duration'		:	600,
					'complete'		:	function(){
											$('#maximize').show();
										}
				})
			},
			'maximize'	:	function(ev){
				$(this).animate({
					'margin-top'	:	'4em',
					'width'			:	'30em',
					'height'		:	$(this).data('origHeight')
				},{
					'queue'			:	false,
					'duration'		:	600
				})
			}
		});
		$(this).find('footer').append(
			$('<p/>').append([
				$('<br/>')[0],
				$('<span>[ </span>')[0],
				$('<a href="#">minimize</a>').click(function(ev){
					$(this).closest('article').trigger('minimize');
				})[0],
				$('<span> ]</span>')[0],
			])
		);
		$(this).append(
			$('<div id="maximize">&hearts;</div>').click(function(ev){
				ev.preventDefault();
				$(this).hide().closest('article').trigger('maximize');
			}).hide()
		);
	});

});