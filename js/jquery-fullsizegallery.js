(function($){
	
	var ns = 'fullsizegallery',
		default_options = {
			images				:	[],
			verticalAlign		:	'center',	//	top, bottom, center
			horizontalAlign		:	'center',	//	left, right, center
			verticalOverflow	:	true,
			horizontalOverflow	: 	true, 
			firstImage			:	0,
			initFadeDuration	:	600,
			slideTimer			:	5000,
			loop				:	true,
			autostart			:	false,
			showFunc			:	function( slide ) {
										slide.fadeIn(1500);
									},
			hideFunc			:	function( slide ) {
										slide.fadeOut(1500);
									}
		};
	
	$.fn.fullsizeGallery = function( param1, param2 ) {
		return this.each( function( obj_i ) {
			
			// reference to outer container object
			var obj = $(this);
			
			if( obj.data('images')==undefined )
				obj.data('images',[]);

			// if first parameter is an options object
			if( $.isPlainObject(param1) ) {
				
				// merge with default options
				var options = {},
					slideTimer = null;

				$.extend(options,default_options,param1)

				// event and trigger for removing existing fullsizeGallery from outer container object
				obj.bind( 'destroyGallery.'+ns, function() {
					$(this).unbind('.'+ns).find('.'+ns).remove();
				}).trigger( 'destroyGallery.'+ns );
				
				// quit if no images are defined
				if( !$.isArray(options.images) || options.images.length==0 )
					return;

				// create and insert inner container and list objects
				var container = $('<div class="'+ns+'"/>').appendTo(obj),
					list = $('<ul class="'+ns+'-list"/>').appendTo(container);
				
				// bind handler for starting slideshow
				obj.bind( 'startSlideshow.'+ns, function( ev ) {
					obj.data('slideshow',true);
					clearTimeout( slideTimer );
					slideTimer = window.setTimeout(function(){
						obj.trigger('nextSlide.'+ns);
						obj.trigger('startSlideshow.'+ns);
					},options.slideTimer);
				});
				
				// bind handler for stopping slideshow
				obj.bind( 'stopSlideshow.'+ns, function( ev ) {
					obj.data('slideshow',false);
					clearTimeout( slideTimer );
				});
				
				// bind handler for toggling slideshow
				obj.bind( 'toggleSlideshow.'+ns, function( ev ) {
					if( obj.data('slideshow')===true )
						obj.trigger('stopSlideshow.'+ns);
					else
						obj.trigger('startSlideshow.'+ns);
				});
				
				// bind handler for next slide
				obj.bind( 'nextSlide.'+ns, function( ev) {
					var nextSlide = obj.data('currentSlide')+1;
					if( nextSlide<list.find('li').length )
						obj.trigger('gotoSlide.'+ns,[nextSlide]);
					else if( options.loop )
						obj.trigger('gotoSlide.'+ns,[0]);
					return;
				})
				
				// bind handler for previous slide
				obj.bind( 'previousSlide.'+ns, function( ev ) {
					var previousSlide = obj.data('currentSlide')-1;
					if( previousSlide>=0 )
						obj.trigger('gotoSlide.'+ns,[previousSlide]);
					else if( options.loop )
						obj.trigger('gotoSlide.'+ns,[list.find('li').length-1]);
					return;
				})
				
				// bind handler for jumping to slide
				obj.bind( 'gotoSlide.'+ns, function( ev, img_index ) {
					var items = list.find('li');
					items.not('.current').css('z-index',0).hide();
					obj.data('currentSlide',img_index);
					options.hideFunc( items.filter('.current').css('z-index',1).removeClass('current') );
					options.showFunc( items.filter(':nth('+img_index+')').css('z-index',2).addClass('current') );
					if( obj.data('slideshow')===true )
						obj.trigger('startSlideshow.'+ns);
				});
				
				// bind handler for fitting images
				obj.bind( 'fitImages.'+ns, function( ev, img_index ) {
					var obj_width = $(this).width(),
						obj_height = $(this).height(),
						obj_ratio = obj_width / obj_height,
						obj_orientation = obj_width>=obj_height ? 'landscape' : 'portrait',
						images = obj.data('images');
					if( img_index!=undefined && images[img_index]!=undefined )
						images = [ images[img_index] ];
					$.each( images, function(){
						var image = this;
						image.container.css({
							width: obj_width,
							height: obj_height
						});
						if( image.$ ) {
							var newWidth, newHeight, newLeft, newTop;
							if( obj_orientation=='landscape' ) {
								if( ( image.origOrientation==obj_orientation && ( ( obj_ratio<image.origRatio && options.horizontalOverflow ) || ( !options.verticalOverflow && obj_width/image.origRatio>obj_height ) ) )
									|| ( image.origOrientation!=obj_orientation && !options.verticalOverflow && obj_width/image.origRatio>obj_height ) ) {
									newHeight = obj_height;
									newWidth = newHeight * image.origRatio;
								}
								else {
									newWidth = obj_width;
									newHeight = newWidth / image.origRatio;
								}
							}
							else {
								if( ( image.origOrientation==obj_orientation && ( ( obj_ratio>image.origRatio && options.verticalOverflow ) || ( !options.horizontalOverflow && obj_height*image.origRatio>obj_width ) ) )
									|| ( image.origOrientation!=obj_orientation && !options.horizontalOverflow && obj_height/image.origRatio>obj_width ) ) {
									newWidth = obj_width;
									newHeight = newWidth / image.origRatio;
								}
								else {
									newHeight = obj_height;
									newWidth = newHeight * image.origRatio;
								}
							}
							newTop = options.verticalAlign=='top' ? 0 : ( options.verticalAlign=='bottom' ? obj_height-newHeight : Math.round((obj_height-newHeight)/2) );
							newLeft = options.horizontalAlign=='left' ? 0 : ( options.horizontalAlign=='right' ? obj_width-newWidth : Math.round((obj_width-newWidth)/2) );
							image.$.css({
								width: newWidth,
								height: newHeight,
								top: newTop,
								left: newLeft
							});
						}
						
					});
				});
				
				// bind handler for setting images
				obj.bind( 'setImages.'+ns, function( ev, imgs ) {
					obj.data('images',[]);
					$.each( imgs, function( img_i ) {
						obj.trigger( 'addImage.'+ns, [imgs[img_i]] );
					});
				});
				
				// bind handler for adding an image
				obj.bind( 'addImage.'+ns, function( ev, image ) {
					if( image==undefined || !$.isPlainObject(image) || image.url==undefined || typeof image.url != 'string' )
						return;
					var images = obj.data('images');
					image.index = images.length;
					image.container = $('<li class="'+ns+'-item loading"/>').css('z-index',0).hide().appendTo(list);
					image.el = new Image();
					image.el.setAttribute( 'class', ns+'-image' );
					image.el.onload = function() {
						image.$ = $(this).appendTo(image.container);
						image.origWidth = this.width;
						image.origHeight = this.height;
						image.origRatio = this.width/this.height;
						image.origOrientation = this.width>=this.height ? 'landscape' : 'portrait';
						image.container.removeClass('loading');
						obj.trigger( 'fitImages.'+ns, image.index );
						if( options.firstImage==image.index ) {
							image.container.addClass('current').css('z-index',2).fadeIn(options.initFadeDuration);
							obj.data('currentSlide',image.index);
							if( options.autostart )
								obj.trigger('startSlideshow.'+ns);
						}
					}
					image.el.src = image.url;
					images.push(image)
					obj.data( 'images', images );
				});

				// bind resize handler on window object
				$(window).unbind( 'resize.'+ns ).bind( 'resize.'+ns, function(){
					$('div.'+ns).each(function(){
						$(this).parent().trigger('fitImages.'+ns);
					})
				});
				
				// set images
				obj.trigger( 'setImages.'+ns, [options.images] );

			}

			// if first parameter is a string, switch on parameter value
			else if( typeof param1 == 'string' ) switch( param1 ) {
				case 'destroyGallery':
				case 'fitImages':
				case 'startSlideshow':
				case 'stopSlideshow':
				case 'toggleSlideshow':
				case 'nextSlide':
				case 'previousSlide':
					obj.trigger( param1+'.'+ns );
					break;
				case 'gotoSlide':
				case 'setImages':
				case 'addImage':
					if( param2!=undefined )
						obj.trigger( param1+'.'+ns, [param2] );
					break;
				default:
			}
			
		})
	}

})(jQuery)