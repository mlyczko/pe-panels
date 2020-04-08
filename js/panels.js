/**
* Plugin Name: PE Panels
* Author: artur.kaczmarek@pixelemu.com
* Version: 1.00
*/

(function($) {

	"use strict";

	// TABS
	// ---------------------------

	function PNhandleTabs() {

		var widget = $('.pe-panels.tabs');

		if ( !widget.length ) return;

		widget.find('.pn-list a').on('click', function(e) {

			e.preventDefault();
			var panelID = $(this).attr('href');
			var panelContent = $('.pe-panels .pn-contents').find(panelID);

			// Show / hide tab content
			panelContent.slideDown(400).siblings().slideUp(400);

			// Change active state
			setTimeout(function() {
				panelContent.addClass('active').siblings().removeClass('active');
			}, 400);

			$(this).parent('li').addClass('active').siblings().removeClass('active');

		});
	}

	//full width
	function PNtabsFull() {

		var windowWidth;

		var widget = $.find('.pe-panels.tabs.full');
		if ( !widget.length ) return;

		function getWidth() {
			windowWidth = $(window).width();
		}

		getWidth();
		$(window).on('resize', getWidth);

		$(widget).each(function(i,e) {

			var breakpoint = $(e).attr('data-responsive');

			var sWidth;
			var liItem = $(e).find('.pn-list li');
			var ItemLength = liItem.length;

			// Each tab will have proportional width only if window width is bigger then 767px
			if ((ItemLength) && ( windowWidth > breakpoint )) {
				sWidth = (100 / ItemLength) + '%';
				liItem.width(sWidth);
			}

		});
	}

	// responsive tabs
	function PNtabsResponsive() {

		var widget = $('.pe-panels.tabs');
		if ( !widget.length ) return;

		widget.each(function(i,e) {
			var windowWidth;
			var head = $(e).find('.pn-headings');
			var headUl = $(e).find('.pn-list');
			var headLi = headUl.find('li');
			var headLink = headLi.find('a');
			var headWidth;
			var responsiveEnabled;
			var itemsWidth;
			var maxScroll;
			var fullwidth;
			var scrollAllowed;
			var breakpoint = $(e).attr('data-responsive');

			// swipe event
			widget.swipe( {
				allowPageScroll: 'vertical',
				swipe:function(event, direction, distance, duration) {
					var itemActive = $(this).find('.pn-list li.active');
					var nextItem = itemActive.next().find('a');
					var prevItem = itemActive.prev().find('a');

					if(direction == 'left') {
						nextItem.trigger('click');
					}
					else if(direction == 'right') {
						prevItem.trigger('click');
					}
				}
			});

			// remove responsive mode
			function unResponsive() {
				//remove responsive
				$(e).removeClass('responsive');
				if( ! $(e).hasClass('desktop')) {
					$(e).addClass('desktop');
				}

				//remove unnecessary styles
				headUl.removeAttr('style');

				headLi.each(function() {
					$(this).removeAttr('style');
				});

				$(e).find('pn-navi').remove();

				//restore full width if needed
				if( fullwidth ) {
					$(e).addClass('full');
					PNtabsFull();
				}

			}

			// navigation
			function addNavi() {

				var naviAdded = $(e).find('.pn-navi');

				if( !naviAdded.length ) {
					$(e).prepend('<div class="pn-navi"><a class="pn-prev" href="#"></a><a class="pn-next" href="#"></a></div>');

					var prevBtn = $(e).find('.pn-prev');
					var nextBtn = $(e).find('.pn-next');

					var itemActive;
					var nextItem;
					var prevItem;

					prevBtn.bind('click', function(event) {
						event.preventDefault();

						itemActive = head.find('.pn-list li.active');
						prevItem = itemActive.prev().find('a');

						if( prevItem.length ) {
							prevItem.trigger('click');
						}

					});

					nextBtn.bind('click', function(event) {
						event.preventDefault();

						itemActive = head.find('.pn-list li.active');
						nextItem = itemActive.next().find('a');

						if( nextItem.length ) {
							nextItem.trigger('click');
						}

					});

				}
			}

			// set widths
			function setSizes() {
				itemsWidth = 0;
				windowWidth = $(window).width();

				//if window size smaller than break point
				if ( windowWidth <= breakpoint ) {
					// remove full width
					if($(e).hasClass('full')) {
						$(e).removeClass('full');
						headLi.removeAttr('style');
						fullwidth = true;
					}

					$(e).removeClass('desktop');
					$(e).addClass('responsive');

					headWidth = Math.ceil(head.outerWidth());

					headLi.each(function() {

						var itemWidth = Math.ceil($(this).outerWidth());

						if(itemWidth > headWidth) {
							itemWidth = headWidth;
							$(this).addClass('long');
						}
						itemsWidth += itemWidth;
						$(this).css('width', itemWidth);

					});

					if( itemsWidth <= headWidth ) { //not need responsive
						if( ! $(e).hasClass('left') && ! $(e).hasClass('right') ) {
							scrollAllowed = false;
							unResponsive();
							return false;
						} else {
							scrollAllowed = false;
							return false;
						}
					}

					scrollAllowed = true;

					maxScroll = itemsWidth - headWidth;
					headUl.css('width', itemsWidth);

					addNavi();

					//scroll to active item
					var item = head.find('.pn-list li.active').attr('data-number');
					scrollToitem(item);

					return true;

				} else { //not need responsive
					scrollAllowed = false;
					unResponsive();
					return false;
				}

			}

			setSizes();

			var widthTimer;
			$(window).resize(function() {
				clearTimeout(widthTimer);
				widthTimer = setTimeout(setSizes, 400);
			});

			// scroll to item
			function scrollToitem(item) {

				var $this = head.find('li[data-number=' + item + ']');
				var position = $this.position();
				var leftCorner = Math.ceil(position.left);
				var rightCorner = Math.ceil(position.left + $this.outerWidth());

				var scrollTo;
				var scrollTmp;
				var overSize;

				var toCenter = (headWidth - $this.outerWidth()) / 2;

				scrollTmp = -Math.abs(leftCorner) + toCenter; //center position

				if(scrollTmp <= -Math.abs(maxScroll)) { // if left larger than max scroll (last tab)

					overSize = Math.abs(scrollTmp) - maxScroll;
					scrollTo = scrollTmp + overSize;

				} else if(scrollTmp >= 0) { // if left larger than 0 (first tab)

					scrollTo = 0;

				} else {

					scrollTo = scrollTmp;

				}

				if ( $.isNumeric(scrollTo) ) {
					headUl.css('left', scrollTo);
				}

				//arrows active class
				var prevBtn = $(e).find('.pn-prev');
				var nextBtn = $(e).find('.pn-next');
				var prevItem = $this.prev();
				var nextItem = $this.next();

				if( nextItem.length ) {
					nextBtn.removeClass('inactive');
				} else {
					nextBtn.addClass('inactive');
				}

				if( prevItem.length ) {
					prevBtn.removeClass('inactive');
				} else {
					prevBtn.addClass('inactive');
				}

			}

			// click event
			headLink.bind('click', function() {
				if( scrollAllowed ) {
					var item = $(this).parent().attr('data-number');
					scrollToitem( item );
				}
			});

		});

	}

	// PANELS
	// ---------------------------

	function PNhandleAccordion() {

		var widget = $('.pe-panels.acco');
		if ( !widget.length ) return;

		widget.each(function () {
			//check multiselect
			if($(this).attr('aria-multiselectable')) {
				var multiSelect = true;
			} else {
				var multiSelect = false;
			}

			var panels = $(this).find('.pn-panel');
			var panelsHeading = panels.find('.pn-heading');
			var panelsContent = panels.find('.pn-content');

			//hide all inactive content
			panels.each(function() {
				if(!$(this).hasClass('active')) {
					$(this).find('.pn-content').hide();
				}
			});

			//on click
			panelsHeading.find('a').click(function(e) {
				e.preventDefault();

				var thisPanel = $(this).closest('.pn-panel');
				var thisContent = $(this).parent().next();

				//if inactive panel was clicked
				if(!thisPanel.hasClass('active')) {
					//hide all panels except this (if not multiselect)
					if(!multiSelect) {
						panelsContent.slideUp(400);
						panelsContent.attr('aria-expanded', 'false');
						setTimeout(function() {
							panels.removeClass('active');
							thisPanel.addClass('active');
						}, 400);
					}
					//make current panel active
					thisPanel.addClass('active');
					thisContent.attr('aria-expanded', 'true');
					thisContent.slideDown(400);
					//if active panel was clicked
				} else {
					//hide current panel
					thisContent.slideUp(400);
					thisContent.attr('aria-expanded', 'false');
					setTimeout(function() {
						thisPanel.removeClass('active');
					}, 400);
				}

			});
		});
	}

	function PNaccordionResponsive() {

		var widget = $('.pe-panels.acco');
		if ( !widget.length ) return;

		widget.each(function(i,e) {

			// swipe event
			widget.swipe( {
				allowPageScroll: 'vertical',
				swipe:function(event, direction, distance, duration) {
					var itemActive = $(this).find('.pn-panel.active');
					var nextItem = itemActive.next().find('a');
					var prevItem = itemActive.prev().find('a');

					if(direction == 'left') {
						nextItem.trigger('click');
					}
					else if(direction == 'right') {
						prevItem.trigger('click');
					}
				}
			});

		});
	}

	$(document).ready(function() {

		PNhandleTabs();
		PNhandleAccordion();

	});

	$(window).load(function() {

		PNtabsFull();
		PNtabsResponsive();
		PNaccordionResponsive();

	});

})(jQuery);
