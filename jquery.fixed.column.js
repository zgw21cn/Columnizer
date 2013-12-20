/*
 * Split html to columns with fixed width and height.
 * by Zhang Guowei
 * 2013/3/29/
 */
if (String.prototype.indexOfRegExp == null) {
	String.prototype.indexOfRegExp = function(pattern, modifiers) {
		var re = new RegExp(pattern, modifiers);
		// cached?
		var m = re.exec(this.valueOf());
		return (m == null ? -1 : m.index);
	}
}

(function($) {
	$.fn.column = function(options) {
		var settings = {
			'width' : '560',
			'height' : '740',
			'gap' : '70',
		};		
		
		var global_page = {
			page_num : 1,
			$page_container : $("<div class='fixed-column-wrap' style='position:relative;height:"
								+settings.height+"px;width:"+settings.width+"px'></div>"),
			$page:null,
			create_page : function() {
				//save $page
				if($(this.$page).length){
					this.$page_container.append(this.$page);
				}
				var column_gap = parseFloat(settings.gap);
				var column_width = parseFloat(settings.width);
				var column_height = parseFloat(settings.height);
				var left = (this.page_num - 1) * (column_gap + column_width);
				var style = 'position:absolute;' 
						  + (this.page_num > 1 ? 'left:' + (left - Math.floor(column_gap / 2)) + 'px;' : '') 
						  + 'width:' + column_width + 'px;' 
						  + (this.page_num > 1 ? 'padding-left:' + Math.ceil(column_gap / 2) + 'px;' : '') 
						  + 'padding-right:' + Math.floor(column_gap / 2) + 'px;' 
						  + 'overflow:hidden;';

				this.$page=$('<div class="jquery-fixed-column" id="page' + this.page_num + '" style="' + style + '"></div>');
				this.$page_container.append(this.$page);
				this.page_num=this.page_num+1;
			}
		}	

		function split_sentence(node) {
			var clone_node=node.cloneNode(true);
			var contents = new Array;
			do {
				contents.push(clone_node);
				if ( split = clone_node.nodeValue.indexOfRegExp('[.:!?。？！]+') + 1) {
					if (split < clone_node.length) {
						clone_node = clone_node.splitText(split);
					} else {
						split = 0;
					}
				}
			} while (split);
			return contents;
		}
		
		function traverse($node, page_wrap, depth) {
			depth++;
			var contents = $node.contents();
			for (var i = 0; i < contents.length; i++) {				
				if (contents[i].nodeType == 3) {
					var text_node=contents[i].cloneNode(true);
					page_wrap.appendChild(text_node);
					//console.log(global_page.$page.height());
					if (global_page.$page.height() > parseFloat(settings.height)) {
						//delete the last content
						page_wrap.lastChild.nodeValue="";
						//split contents by word
						var sentence_contents = split_sentence(contents[i]);
						var sentence_index = 0;
						for (; sentence_index < sentence_contents.length; sentence_index++) {
							page_wrap.lastChild.nodeValue = page_wrap.lastChild.nodeValue + sentence_contents[sentence_index].nodeValue;
							if (global_page.$page.height() > parseFloat(settings.height)) {
								//delete the last added content
								var split=page_wrap.lastChild.nodeValue.length-sentence_contents[sentence_index].nodeValue.length
								page_wrap.lastChild.nodeValue=page_wrap.lastChild.nodeValue.slice(0,split);
								//clone current page
								var $topNode;
								if (depth > 1) {
									$topNode = $(page_wrap).parents().eq(depth - 2);
								} else {
									$topNode = $(page_wrap);
								}
								global_page.$page.html($topNode[0].cloneNode(true));
								//new page
								global_page.create_page();
								global_page.$page.append($topNode);

								var find_depth = depth - 1;
								while (find_depth > 0) {
									//clear sibling node
									var parent_node = $(page_wrap).parents().eq(--find_depth);
									parent_node.siblings().remove();
									//clear text node
									var text_node = parent_node.contents().filter(function() {
										return this.nodeType === 3;
									});
									text_node.remove();
								}
								//clear my sibling
								$(page_wrap).siblings().remove();
								//clear my children
								$(page_wrap).empty();
								//add class for join later
								$(page_wrap).addClass('column-split-content');
								//add the last text node
								page_wrap.appendChild(sentence_contents[sentence_index].cloneNode(true));
								//refresh original contents
								//concat left contents
								var left_contents=""
								for(var k=sentence_index+1;k<sentence_contents.length;k++){
									left_contents+=sentence_contents[k].nodeValue;
								}						
								contents[i].nodeValue=left_contents;
							}
						}
					}
				}
 				else if (contents[i].nodeType == 1) {
					var new_node = contents[i].cloneNode(false);
					$(page_wrap).append($(new_node).removeAttr("id"));
					if(new_node.nodeName.toLowerCase() === 'img'){						
						if (global_page.$page.height() > parseFloat(settings.height)) {
							//delete the last added node
							page_wrap.removeChild(page_wrap.lastChild);
							//clone current page
							var $topNode;
							if (depth > 1) {
								$topNode = $(page_wrap).parents().eq(depth - 2);
							} else {
								$topNode = $(page_wrap);
							}
							global_page.$page.html($topNode[0].cloneNode(true));
							//new page
							global_page.create_page();
							global_page.$page.append($topNode);

							var find_depth = depth - 1;
							while (find_depth > 0) {
								//clear sibling node
								var parent_node = $(page_wrap).parents().eq(--find_depth);
								parent_node.siblings().remove();
								//clear text node
								var text_node = parent_node.contents().filter(function() {
									return this.nodeType === 3;
								});
								text_node.remove();
							}
							//clear my sibling
							$(page_wrap).siblings().remove();
							//clear my children
							$(page_wrap).empty();
							//add class for join later
							$(page_wrap).addClass('column-split-content');
							//add the last img node
							page_wrap.appendChild(new_node);
						}
					}
					var sibling_depth = depth;
					traverse($(contents[i]), new_node, depth);
					depth = sibling_depth;
				}
			}
		}

		return this.each(function() {
			// Merge options
			if (options) {
				$.extend(settings, options);
			}
			var element			= this;
			//save img's height and width to array
			var list=[];
			var imgs=[];
			$(element).find('img').each(function(){
				list.push($(this));
				var img=new Image();
				img.src=$(this).attr('src');
				imgs.push(img);
			})
			var dtd=$.Deferred();
			var wait=function(dtd){
				var count=0;
				var task=function(){
					count++;
					var i = 0;								
					for (; i < list.length; i++) {
						if (imgs[i].width !== 0 && imgs[i].height !== 0 && imgs[i].width * imgs[i].height > 0) {
							var height=Math.min(imgs[i].height,parseFloat(settings.height)-10);
							list[i].css('max-height',height+'px');
							var width=Math.min(imgs[i].width,parseFloat(settings.width)-10);
							list[i].css('max-width',width+'px');
						}
					}									
					//check
					var result=true;					
					for(i=0;i<list.length;i++){						
						//alert(list[i].css('height').replace(/[^-\d\.]/g, ''));
						if (parseInt(list[i].css('height').replace(/[^-\d\.]/g, '')) == 0) {
							result = false;
						}
						//after 100*50ms,if the img is not loaded yet,then delete it.
						if(count>100){
							list[i].remove();							
							imgs.splice(i,1);
							list.splice(i--,1);
							count=0;
						}
					}
					if(result){
						stop();
						dtd.resolve();
					}					
				};				
				var stop = function() {
					clearInterval(intervalId);
					intervalId = null;
				}
				intervalId = setInterval(task, 50);
				return dtd;
			}
			$.when(wait(dtd)).done(function(){				
				var page_wrap = element.cloneNode(false);
				global_page.create_page();
				global_page.$page.append($(page_wrap).removeAttr("id"));
				$(element).parent().html(global_page.$page_container);
				var depth = 0;
				traverse($(element), page_wrap, depth);
				//send finished message
				$.event.trigger('columnFinished');
			});			
		});

	};
})(jQuery);
