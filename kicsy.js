/**
Kicsy framework
*/


function Kicsy(id)
{
	
	/** To get ID unique number for objects	
	*/
	id = id == undefined ? 0 : id;
	
//   *********************************************************   Tools objects  *************************************************	
	
	/**
	Class wich manage an internal array with some convenient methods.
	Works like mutable class with variants object type. 
	*/
	function ArrayList() {
		/** Internal array */
		this.elements = new Array();
		/** Use for iterate over elements */
		this.index = 0;
		
		/**
		Pass all arguments as objects into array
		*/
		this.append = function() {
			for (i=0; i<arguments.length; i++) {
				this.elements[this.elements.length] = arguments[i];	
			}
		}
		
		
		/** Pass all array's element into internal array */
		this.appendArray = function(array) {
			for (i=0; i<array.length; i++) {
			this.elements[this.elements.length] = array[i];	
			}
		}
		
		/** Retrieve an element  by its index */
		this.item  = function (index) {
			return this.elements[index];
		}
		/** Retrieve next element */
		this.next = function() {
			if (this.index >= this.elements.length) { return false; }
			var e = this.elements[this.index];
			this.index = this.index + 1;
			return e;
		}
		
		/** Reset counter index */
		this.reset = function() {this.index = 0;}
		
		/** Return length of internal array */
		this.count = function() { return this.elements.length; }
		
		/** Alias for count function */
		this.length = this.count;
	}
	
	
	function mergeObjects(objects) {
		var r = {}
		for (i=0; i<arguments.length; i++) {
			for (p in arguments[i]) {r[p]=arguments[i][p]}	
		}
		return r;		
	}
	
	/** Add px sufix  */
	function px(n){ return n + "px";}
	
	/** Remove px suffix */
	function noPx(s) {
			var n = s.indexOf("px");
			var r = parseInt(s.substr(0,n));
			return r;
	}
	
	
	

//   *********************************************************   Basis classes  *************************************************
	function KicsyBaseObject() {
		id = id++;
	}
	
	
	/** Base class used to create components */
	function Component(elementName,type) {
		// Inherit from base class
		this.base = KicsyBaseObject;
		this.base();
		//Some properties
		this.published = false;
		this.element = null;
		elementName = elementName == undefined ? "div" : elementName;
		this.name = "WITHOUT_NAME";
		
		
		this.setName = function (name) {
			this.name = name;
			if (this.element != undefined) {
				this.element.setAttribute("name",this.name);
			}
		}
			
		
		
		this.build = function() {
			this.element = document.createElement(elementName);
			this.element.setAttribute("id", "ID_" + id);
			this.element.setAttribute("name",this.name);
			if(type!=undefined){
				this.element.setAttribute("type", type);
			}
		}
		
		this.publish = function(onComponent) {
			if (this.element == undefined) {
				this.build();
			}
			var publisher = onComponent == undefined ? document.body : onComponent.element;
			publisher.appendChild(this.element);
			this.published = true;	
		}
		return this;
	}
	
	
	
	
	function Constraint(component,type,distance)
	{
		if(type==undefined) {type="alignTop";}
		if(distance==undefined) {distance=0;}
		
		this.component = component;
		this.type = type;
		this.distance = distance;
		return this;	
	}
	
	
	this.Constraint=Constraint;
	
	function VisualComponent(elementName,type, styles) {
		this.base = Component;
		this.base(elementName,type);
		this.value = null;
		this.left = 0;
		this.top = 0;
		this.height = 0;
		this.width = 0;
		//this.styles = ;
		this.constraints = new ArrayList();

		//Callbacks
		this.sizeChanged = false; //Change for appropiate function
	
		//Apply Styles
		this.applyStyle = function(styles) {
			styles = mergeObjects({position: "absolute"}, styles);
			//Adjunt styles
			for (style in styles) {
			  var s =  styles[style];
			  if (s.constructor === String) {
				  s = "\"" + s + "\"";
			  }
			  var q =  "this.element.style." + style + "=" + s;
			  eval(q);
			}
		}
	
		//Building
		this._VisualComponentBuild = this.build;
		this.build = function() {
			this._VisualComponentBuild();
			this.setValue(this.value);
			this.setPosition(this.left, this.top);
			this.setSize(this.width, this.height);
			this.applyStyle(styles);
			this.readSize();
			this.readPosition();
		}
		
		
		//Setter and getter of values
		this.setValue = function (value) {
			this.value = value;
			if ((this.element!=undefined) && (this.element.value != undefined)) {
				this.element.value = value;
			}
		}
		
		this.getValue = function() {
			if ((this.element!=undefined) && (this.element.value != undefined)) {
				 this.value = this.element.value
			}
			return this.value;
		}
		
		
		this.setPosition = function(left, top) {
			this.left = left;
			this.top = top;
			if (this.element!=undefined) {
				this.element.style.left = px(this.left);
				this.element.style.top = px(this.top);
				this.performLayout();
			}
		}
		
		this.readPosition = function() {
			if (this.element!=undefined) {
			  this.top = noPx(this.element.style.top);
			  this.left = noPx(this.element.style.left);
			}
		}
		
		this.readSize = function() {
			if (this.element!=undefined) {
			  this.height = noPx(this.element.style.height);
			  this.width = noPx(this.element.style.width);	
			}
		}
		
		this.setSize = function(width, height) {
			this.height = height;
			this.width = width;
			if (this.element!=undefined) {
				this.element.style.width = px(this.width);
				this.element.style.height = px(this.height);
			}
			if(this.sizeChanged) {
				//If setted, call this method, with itself as argument
				this.sizeChanged(this);
			}
		}
		
		this.makeDraggable = function(targetComponent, draggableComponent) {
			var pos1;
			var pos2;
			var pos3;
			var pos4;

			function dragMouseDown(e) {
			  e = e || window.event;
			  e.preventDefault();
			  pos3 = e.clientX;
			  pos4 = e.clientY;
			  document.onmouseup = closeDrag;
			  document.onmousemove = elementDrag;
			}
			
			function elementDrag(e) {
				e = e || window.event;
				e.preventDefault();	
				pos1 = pos3 - e.clientX;
				pos2 = pos4 - e.clientY;
				pos3 = e.clientX;
				pos4 = e.clientY;
				draggableComponent.setPosition(draggableComponent.element.offsetLeft - pos1,draggableComponent.element.offsetTop - pos2);
			}
			
			function closeDrag() {
			  document.onmouseup  = null;
			  document.onmousemove = null;
			}
			
			targetComponent=targetComponent==undefined?this:targetComponent;
			draggableComponent=draggableComponent==undefined?targetComponent:draggableComponent;
			targetComponent.element.onmousedown = dragMouseDown;	
		}
		
		
		
		/**
		Read constrainst from others components attachet to it and proccess them
		*/
		this.performLayout = function() {
		
			for(var i=0; i<this.constraints.count(); i++) {
				var c = this.constraints.item(i);
			
					switch (c.type) 
					{
						case "alignTop":
							c.component.setPosition(c.component.left, this.top + c.distance);
							break;
						
						case "alignLeft":
							c.component.setPosition(this.left + c.distance, c.component.top);
							break;
							
						case "alignBottom":
							c.component.setPosition(c.component.left, c.distance + (this.top + this.height) - c.component.height);
							break;
						
						case "alignRight":
							c.component.setPosition(c.distance + (this.left + this.width) - c.component.width, c.component.top);
							break;
							
						case "connectLeftWithRight":
						    c.component.setPosition(this.left + this.width + c.distance, c.component.top);
						break;
						
						case "connectRightWithLeft":
						    c.component.setPosition(this.left - (c.component.width + c.distance), c.component.top);
						break;
						
						case "connectTopWithBottom":
						    c.component.setPosition(c.Left, this.top + this.height + c.distance);
						break;
						
						case "connectBotomWithTop":
						    c.component.setPosition(c.Left, this.top - (c.component.height + c.distance))
						break;
						
						case "connectAllWith":
							c.component.setPosition(c.distance, c.distance);
							c.component.setSize(this.width - (c.distance * 2), this.height - (c.distance * 2));
						break;
						

					}
			}
		}
		
		this.alignTopWith = function(visualComponent) {
			visualComponent.constraints.append(new Constraint(this,"alignTop",0));
		}
		
		this.alignLeftWith = function(visualComponent) {
			visualComponent.constraints.append(new Constraint(this,"alignLeft",0));
		}
		
		
		this.alignBottomWith = function(visualComponent) {
			visualComponent.constraints.append(new Constraint(this,"alignBottom",0));
		}
		
		this.alignRightWith = function(visualComponent) {
			visualComponent.constraints.append(new Constraint(this,"alignRight",0));
		}
		
		this.connectLeftWithRightOf = function(visualComponent, separation) {
			visualComponent.constraints.append(new Constraint(this,"connectLeftWithRight",separation));
		}
		
		this.connectRightWithLeftOf = function(visualComponent, separation) {
			visualComponent.constraints.append(new Constraint(this,"connectRightWithLeft",separation));
		}
		
		this.connectTopWithBottomOf = function(visualComponent, separation) {
			visualComponent.constraints.append(new Constraint(this,"connectTopWithBottom",separation));
		}
		
		this.connectBottomWithTopOf = function(visualComponent, separation) {
			visualComponent.constraints.append(new Constraint(this,"connectBotomWithTop",separation));
		}
		
		this.connectAllWith = function(visualComponent, separation) {
			visualComponent.constraints.append(new Constraint(this,"connectAllWith",separation));
		}

	return this;
	}
	
	
	function ContainerComponent(elementName,type, styles) {
		this.base = VisualComponent;
		this.base(elementName,type, styles);
		this.components = new ArrayList();
	
	
		/*
		overwrite Build
		*/
		this._ContainerComponentBuild = this.build;
		this.build = function() {
			this._ContainerComponentBuild();
			this.components.reset();
			var e = true;
			  while(e) {
			  e = this.components.next();
			  if(e) {
				  e.publish(this);	
			  }
		  }
		}
	
	
		this._ContainerComponentPublish = this.publish;
		this.publish = function(onComponent) {
			this._ContainerComponentPublish(onComponent)
			var e = true;
			  while(e) {
			  e = this.components.next();
			  if(e) {
				  e.publish(this);	
			  }
		  }
		}
		
		/**
		Append components: Could be an array or as arguments
		*/
	    this.append = function(components) {
			for(var i=0; i<arguments.length; i++)
			{
				var c = arguments[i];
				this.components.append(c);
				if(this.element!=undefined) {
					c.publish(this);
				}
			}
		  }
		  
		  
		  this._ContainerComponentPerformLayout = this.performLayout;
		  this.performLayout = function (){
			this.components.reset();
			var e = true;
			while(e) {
				e = this.components.next();
				if(e) {
					e.performLayout();	
				}
			}
		  this._ContainerComponentPerformLayout();
		  }
	}
	
	
	
	
	/**
	This object perform layout of all components.
	Each component must have "width" property setted.
	First component of each row is the reference for positioning all else components
	*/
	
	this.Organizer=function(containerComponent) {
		this.horizontalSeparation = 8;
		this.verticalSeparation = 8;
		var dx = 0;
		var dy = 0;
		
		var firstComponent = null;
		var topComponent = null;
		var firstRowComponent = null;
		var leftComponent = null;
		var superiorComponent = null;
		
		
		this.appendRow = function (components) {
			
			for(var i = 0; i<arguments.length; i++) {
				var c = arguments[i];
				containerComponent.append(c);
				
				if(firstComponent==undefined) {
					firstComponent = c;
				}
								
				if (firstRowComponent == undefined) {
					firstRowComponent = c;
					
					if(topComponent != undefined) {
						firstRowComponent.connectTopWithBottomOf(topComponent,this.verticalSeparation);
						firstRowComponent.alignLeftWith(topComponent);
					}
					
				} else {
					c.alignTopWith(firstRowComponent);
				}

				if(leftComponent==undefined) {
					leftComponent = c;
				} else {
					c.connectLeftWithRightOf(leftComponent, this.horizontalSeparation);
					leftComponent = c;	
				}
			}
			topComponent = firstRowComponent;
			firstRowComponent = null;
			leftComponent = null;
			
		}
		
		
		
		
		/*
		this.appendRow = function(components) {
			for(var i = 0; i<arguments.length; i++) {
				var c = arguments[i];
				containerComponent.append(c);
				
				if(firstRowComponent==undefined) {
					firstRowComponent = c;
				}
				
				if(superiorComponent!=undefined) {
					c.connectTopWithBottomOf(superiorComponent,this.verticalSeparation);
				}
				
				if(firstComponent==undefined) {
					firstComponent = c;
					leftComponent = c;	
					} else {
					c.connectLeftWithRightOf(leftComponent, this.horizontalSeparation);
					c.alignTopWith(firstRowComponent);
					leftComponent = c;
				}
			}
			superiorComponent = firstRowComponent;
			firstRowComponent = null;
		}
		*/

		this.performLayout = function () {
			firstComponent.performLayout();
		}
	}
	

//   *********************************************************   Components *************************************************
	this.Button = function (styles)
	{
		this.base = VisualComponent;
		this.base("input", "button", styles);
		return this;	
	}
	
	this.Text = function (styles)
	{
		this.base = VisualComponent;
		this.base("input", "text", styles);
		return this;	
	}
	
	this.Password = function (styles)
	{
		this.base = VisualComponent;
		this.base("input", "password", styles);
		return this;	
	}
	
	this.Checkbox = function (styles)
	{
		this.base = VisualComponent;
		this.base("input", "checkbox", styles);
		return this;	
	}
	
	this.Submit = function (styles)
	{
		this.base = VisualComponent;
		this.base("input", "submit", styles);
		return this;	
	}
	
	this.Form = function (styles)
	{
		this.base = ContainerComponent;
		this.base("Form", null, styles);
		return this;	
	}
	
	this.Reset = function (styles)
	{
		this.base = VisualComponent;
		this.base("input", "reset", styles);
		return this;	
	}
	
	this.File = function (styles)
	{
		this.base = VisualComponent;
		this.base("input", "file", styles);
		return this;	
	}
	
	this.Option = function (styles)
	{
		this.base = VisualComponent;
		this.base("input", "option", styles);
		return this;	
	}
	
	this.Image = function (styles)
	{
		this.base = VisualComponent;
		this.base("img", null, styles);
		return this;	
	}
	
	this.Layer = function (styles)
	{
		this.base = ContainerComponent;
		this.base("div", null, styles);
		this.setValue=function(value) {
			this.value = value;
			if(this.element != undefined) {
				this.element.innerHTML=value;
			}
		}
		return this;	
	}
	
	
	
	this.Window = function(windowTheme) {
		
		//Define theme:
		windowTheme = windowTheme == undefined ? this.windowThemeDefault : windowTheme;
		windowTheme = mergeObjects({position: "absolute"},windowTheme)

		
		// Inherit from  ContainerComponent
		this.base = ContainerComponent;
		this.base("div", null, windowTheme.main);
		
		//Defaults sizes
		this.headHeight = 30;
		this.footHeight = 30;
		this.bodyHeight = 200;
		this.width = 400;
		this.height = 400;
		
		//Some properties
		this.title = "Window";
		
		//Build inner sublayers
		var _k = new Kicsy(id);

		this.head =  new _k.Layer(windowTheme.head);
		this.body =  new _k.Layer(windowTheme.body);
		this.foot =  new _k.Layer(windowTheme.foot);
		
		//append sublayer into main layer
		this.append(this.head);
		this.append(this.body);
		this.append(this.foot);
		
		//Overwite append method:
		this.append = function(components) {
			for(var i=0; i<arguments.length; i++) {
			  this.body.append(arguments[i]);
			}
		}
		
		
		//Overwirte setSize for handling all parts
		this._windowSetSize = this.setSize;
		this.setSize = function (width, height) {
			this._windowSetSize(width, height);
			this.bodyHeight = height - this.headHeight - this.footHeight;
			this.head.setSize(width, this.headHeight);
			this.body.setSize(width, this.bodyHeight);
			this.foot.setSize(width, this.footHeight);
			this.head.setPosition(0,0);
			this.body.setPosition(0,this.headHeight);
			this.foot.setPosition(0,this.headHeight + this.bodyHeight);
		}
		
		
		/**
		Setter Window title
		*/
		this.setTitle = function(title) {
			if(this.head.element!=undefined) {
				this.head.element.innerHTML = title;
			}
			this.title = title;
		}
		
		
		//Overwrite build:
		this._windowBuild = this.build;
		this.build = function() {
			this.setSize(this.width, this.height);
			this._windowBuild();
		}
		
		
		this._windowPublish = this.publish;
		this.publish = function (onComponent) {
		  {
			  this._windowPublish(onComponent);
			  this.setTitle(this.title);
			  this.setSize(this.width, this.height);
	  		  this.makeDraggable(this.head, this);
			  this.centerBoth();
		  }
		}

		this.centerHorizontally = function (){
			this.readPosition();
			this.setPosition((screen.availWidth/2) - (this.width/2),this.top);
		}
		
		this.centerVertically = function (){
			this.readPosition();
			this.setPosition(this.left, (screen.availHeight/2) - (this.height/2));
		}
		
		this.centerBoth  =function() {
			this.centerHorizontally();
			this.centerVertically();
		}
		
		return this;
	} // Window
	
	
	/** 
	Vertical splitter
	*/
	this.VerticalSplitter = function(style) {
		
		// Inherit from  ContainerComponent
		this.base = ContainerComponent;
		this.base("div", null, mergeObjects({overflow: "hidden"}, style));
		
		this.separatorWidth = 16;
		this.separatorPosition = 0;
		
		var _k = new Kicsy(id);
		this.panelLeft = new _k.Layer(style);
		this.panelRight = new _k.Layer(style);
		this.separator = new _k.Layer(mergeObjects(style,{marging:"40px", cursor: "ew-resize"}));
		this.append(this.panelLeft, this.separator, this.panelRight);
		
		this._VerticalSplitterBuild = this.build;
		this.build = function() {
			this._VerticalSplitterBuild();
			this.separator.element.onmousedown = dragMouseDown;
			this.separator.element.splitter = this; 
		}
		
		this._VerticalSplitterSetSize = this.setSize;
		this.setSize = function(width, height) {
			this._VerticalSplitterSetSize(width, height);
			this.performLayout();
		}
		
		this.performLayout = function() {
			this.panelLeft.setSize((this.width/2) - (this.separatorWidth/2) + this.separatorPosition, this.height);
			this.panelRight.setSize((this.width/2) - (this.separatorWidth/2) - this.separatorPosition, this.height);
			this.separator.setSize(this.separatorWidth, this.height);
			this.panelLeft.setPosition(0,0);
			this.separator.setPosition(this.panelLeft.width,0);
			this.panelRight.setPosition(this.panelLeft.width + this.separator.width,0)
		}
		
		var x1=0;
		var x2=0;
		
		function dragMouseDown(e) {
			  e = e || window.event;
			  e.preventDefault();
			  x2 = e.clientX;
			  document.onmouseup = closeDrag;
			  document.onmousemove = elementDrag;
			  e.target.onmouseout = closeDrag;
		}
			
		function elementDrag(e) {
			e = e || window.event;
			e.preventDefault();	
			x1 = x2 - e.clientX;
			x2 = e.clientX;
			e.target.splitter.separatorPosition = e.target.splitter.separatorPosition - x1;
			e.target.splitter.performLayout();
		}
			
		  function closeDrag() {
			document.onmouseup  = null;
			document.onmousemove = null;
		  }		
		
	}
	
}




// *********************************************************  Components themes ****************************************************

Kicsy.prototype.themeDefault =  {
	  backgroundColor: "white",
	  border: "1px solid black",
	  borderRadius: "10px",
	  boxShadow: "4px 4px lightgray"
}


Kicsy.prototype.windowThemeDefault = {
		name: "Default window theme",
		author: "Kicsy",
		target: "Window",
		
		main: {
			border: "1px solid black",
			position: "absolute",
			backgroundColor: "none",
			boxShadow: "10px 10px 5px rgba(0,0,0,0.3)",
			borderRadius: "20px",
			margin: "0px",
			padding: "0px",
			overflow: "hidden"
		},
		
		head: {
			backgroundColor : "rgba(100,100,100,0.2)",
			margin: "0px",
			textAlign : "center",
			paddingTop: "10px",
			cursor: "move"
		},
		
		body: {
			backgroundColor : "white",
			margin: "0px",
			padding: "0px",
			overflow: "none"
		},
		
		foot: {
			backgroundColor :  "rgba(0,0,0,0.1)",
			margin: "0px"
		}
}
