Columnizer
==========

Split html to columns with fixed width and height.

Although W3C multi-column module was released by the W3C, IE does not support it. Columnizer is a jquery function that split html to columns with fixed width and height. Columnizer will decide to how many columns to be splited when you specify the each column's width and height. Even if there are images in the htm contents, it can be splited successfully.

## usage

	$('.article-content-root').column();
	
or

	$('.article-content-root').column({'width' : '560','height' : '740','gap' : '70',});

