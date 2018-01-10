window.ISAPP=window.ISAPP||false;
var HtmlUtil = {
    /*1.用浏览器内部转换器实现html转码*/
    htmlEncode:function (html){
        //1.首先动态创建一个容器标签元素，如DIV
        var temp = document.createElement ("div");
        //2.然后将要转换的字符串设置为这个元素的innerText(ie支持)或者textContent(火狐，google支持)
        (temp.textContent != undefined ) ? (temp.textContent = html) : (temp.innerText = html);
        //3.最后返回这个元素的innerHTML，即得到经过HTML编码转换的字符串了
        var output = temp.innerHTML;
        temp = null;
        return output;
    },
    /*2.用浏览器内部转换器实现html解码*/
    htmlDecode:function (text){
        //1.首先动态创建一个容器标签元素，如DIV
        var temp = document.createElement("div");
        //2.然后将要转换的字符串设置为这个元素的innerHTML(ie，火狐，google都支持)
        temp.innerHTML = text;
        //3.最后返回这个元素的innerText(ie支持)或者textContent(火狐，google支持)，即得到经过HTML解码的字符串了。
        var output = temp.innerText || temp.textContent;
        temp = null;
        return output;
    },
    /*3.用正则表达式实现html转码*/
    htmlEncodeByRegExp:function (str){  
         var s = "";
         if(str.length == 0) return "";
         s = str.replace(/&/g,"&amp;");
         s = s.replace(/</g,"&lt;");
         s = s.replace(/>/g,"&gt;");
         s = s.replace(/ /g,"&nbsp;");
         s = s.replace(/\'/g,"&#39;");
         s = s.replace(/\"/g,"&quot;");
         return s;  
   },
   /*4.用正则表达式实现html解码*/
   htmlDecodeByRegExp:function (str){  
         var s = "";
         if(str.length == 0) return "";
         s = str.replace(/&amp;/g,"&");
         s = s.replace(/&lt;/g,"<");
         s = s.replace(/&gt;/g,">");
         s = s.replace(/&nbsp;/g," ");
         s = s.replace(/&#39;/g,"\'");
         s = s.replace(/&quot;/g,"\"");
         return s;  
   }
};
function extend(obj) {
	var type=function(obj){
		//'boolean', 'number', 'string', 'function', 'array', 'date', 'regexp', 'object', 'error'
		return obj == null ? String(obj) : {}.toString.call(obj).toLowerCase().replace(/\[object\s|\]/g, '')|| "object";
	},
	isArray=Array.isArray||function(arr) {
		return type(arr) === 'array';
	},
	isObject=function(obj) {
		return type(obj) === "object";
	},
	each=function(obj,callback){
		var len=0,i=0;
		if(!obj){return;}
		if(isArray(obj)){
			for(len=obj.length;i<len;i++){
				var val=callback.call(obj[i],i,obj[i]);
				if(val===false) break;
			}
		}else if(isObject(obj)){
			for(i in obj){
				if(obj.hasOwnProperty(i)){
					var val=callback.call(obj[i],i,obj[i]);
					if(val===false) break;
				}
			}
		}else{
			throw Error("参数格式错误")
		}
	};
	
	each([].slice.call(arguments,1), function(i,value) {
		for(var prop in value) {
			obj[prop] = value[prop];
		}
	});
	return obj;
}; 


//优化鼠标滚动位置距离
function MouseWheel(e) {
	if (e.stopPropagation) {
		e.stopPropagation();
	} else {
		e.cancelBubble = true;
	} 
	if (e.preventDefault) {
		e.preventDefault();
	} else {
		e.returnValue = false;
	}
	if(this.lock){
		return;
	}
	var isUp = e.wheelDelta > 0
	var st = Math.max(this.scrollTop, this.scrollTop);
	this.scrollTop = st + (isUp ? -30 : 30);
}

window.onload=function () {
	var $=document.querySelector.bind(document);
	$(".list-box").onmousewheel = MouseWheel;
	$(".notes-box").onmousewheel = MouseWheel;
};

//自定指令
var directives={
	directives:{
		//拖动事情
		"menu-drag":function(el){
			el.onmousedown=function(){
				if(ISAPP){window.windowCommand("drag")};
				console.log("event drag")
			}
		},
		//最小化事件
		"menu-min":function(el){
			el.onclick=function(){
				if(ISAPP){window.windowCommand("min")};
				console.log("event min")
			}
		},
		//关闭事件
		"menu-close":function(el){
			el.onclick=function(){
				if(ISAPP){window.windowCommand("close")};
				console.log("event close")
			}
		}
	}
};

+function(){
	var NOTES_TYPE_MAP={};
	
	//列表右键菜单
	var comContentMenu={
		data:{
			oContextMenu:{
				left:0,
				top:0,
				show:false
			},
			oClient:{
				docWidth:0,
				docHeight:0,
				width:0,
				height:0
			}
		},
		methods:{
			//右击事件
			evContextMenu:function(event,index,value){
				event.preventDefault();
				this.tabNotesType(index);
				if(index===-1){
					this.hideContextMenu();
					return;
				}
				this.setNotesTypeInfo(index,value);
				this.showContextMenu();
				this.$nextTick(function(){
					this.fixPosition(event.clientX+2,event.clientY+2)
				})
				
			},
			//处理边界定位
			fixPosition:function(x,y){
				this.getSize();
				
				if(x+this.oClient.width>this.oClient.docWidth){
					if(x-this.oClient.width-2<0){
						this.oContextMenu.left=this.oClient.docWidth-this.oClient.width;
					}else{
						this.oContextMenu.left=x-this.oClient.width-2;
					}
				}else{
					this.oContextMenu.left=x;
				}
				if(y+this.oClient.height>this.oClient.docHeight){
					if(y-this.oClient.height-2<0){
						this.oContextMenu.top=this.oClient.docHeight-this.oClient.height;
					}else{
						this.oContextMenu.top=y-this.oClient.height-2;
					}
					
				}else{
					this.oContextMenu.top=y;
				}
			},
			//更新页面及菜单大小
			getSize:function(){
				this.oClient.docWidth=document.documentElement.clientWidth;
				this.oClient.docHeight=document.documentElement.clientHeight;
				this.oClient.width=this.$refs.menu.offsetWidth;
				this.oClient.height=this.$refs.menu.offsetHeight;
			},
			//隐藏右键菜单
			hideContextMenu:function(){
				this.oContextMenu.show=false;
				//解除列表滚动
				this.$refs.notesType.lock=false;
			},
			//显示右键菜单
			showContextMenu:function(){
				this.oContextMenu.show=true;
				//禁止列表滚动
				this.$refs.notesType.lock=true;
			}
		},
		mounted:function(){
			this.$nextTick(function(){
				//更新页面及菜单大小
				this.getSize();
			})
		}
	};
	//记事内容逻辑
	var comNotesContent={
		data:{
			//记事内容数据
			oNotesContent:{
				list:[],
				info:{
					type:"",
					show:false,
					data:{
						typeUuid:null,
						uuid:null,
						title:"",
						content:"",
						addTime:null,
						modifyTime:null,
						oldTitle:"",
						oldContent:""
					}
				}
			}
		},
		computed:{
			//记事列表 筛选
			aNotesContentList:function(){
				if(this.oNotesType.active===-1){
					return this.oNotesContent.list;
				}
				return this.oNotesContent.list.filter(function(value,index){
					return value.typeUuid===this.oNotesType.notesTypeSelect.uuid;
				}.bind(this))
			}
		},
		methods:{
			//设置 记事表单内容
			setNotesContentInfo:function(value,object){
				this.oNotesContent.info.data=extend({},value,object);
			},
			//获取 记事列表 索引值
			getNotesContentIndex:function(value,attr){
				attr=attr||"uuid"
				for(var i=0;i<this.oNotesContent.list.length;i++){
					if(value===this.oNotesContent.list[i][attr]){
						return i;
					}
				}
				return -1;
			},
			//显示 记事表单
			showNotesContent:function(){
				this.oNotesContent.info.show=true;
			},
			//隐藏 记事表单
			hideNotesContent:function(bCheck){
				var title=this.oNotesContent.info.data.title,oldTitle=this.oNotesContent.info.data.oldTitle,
					content=this.oNotesContent.info.data.content,oldContent=this.oNotesContent.info.data.oldContent;
				var _flag=true;
				if(bCheck){
					if(title!==oldTitle||content!==oldContent){
						_flag=confirm("你确认要放弃当前的修改吗？");
					}
				}
				
				if(!_flag){return;}
				
				this.oNotesContent.info.show=false;
				this.setNotesContentInfo({
					typeUuid:null,
					uuid:null,
					title:"",
					content:"",
					addTime:null,
					modifyTime:null
				},{
					oldTitle:"",
					oldContent:""
				});
			},
			//增 记事
			addNotesContent:function(){
				this.oNotesContent.info.type="add";
				this.showNotesContent();
				
				this.setNotesContentInfo({
					typeUuid:null,
					uuid:null,
					title:"",
					content:"",
					addTime:null,
					modifyTime:null
				},{
					oldTitle:"",
					oldContent:""
				});
				console.log("content-add");
			},
			//改 记事
			modifyNotesContent:function(value){
				this.oNotesContent.info.type="modify";
				this.setNotesContentInfo(value,{
					oldTitle:value.title,
					oldContent:value.content
				});
				this.showNotesContent();
				console.log("content-modify");
			},
			//删 记事
			delNotesContent:function(v){
				var _flag=confirm("确认要删除此条信息吗？")
				var _index=-1;
				var _sJson="";
				if(_flag){
					if(ISAPP){
						_sJson=JSON.stringify([v.uuid]);
						window.external.dataDelete("notes",_sJson);
					}else{
						_index=this.getNotesContentIndex(v.uuid);
						if(_index!==-1){
							this.oNotesContent.list.splice(_index,1);
						}
					}
					console.log("content-delete");
				}
				
			},
			//存 记事
			saveNotesContent:function(){
				var _index=-1;
				this.checkNotesContent();
				if(this.oNotesContent.info.type==="add"){
					delete this.oNotesContent.info.data.oldTitle;
					delete this.oNotesContent.info.data.oldContent;
					
					this.oNotesContent.info.data.addTime=Date.now();
					this.oNotesContent.info.data.modifyTime=Date.now();
					this.oNotesContent.info.data.uuid=this.getUuid();
					this.oNotesContent.info.data.typeUuid=this.oNotesType.notesTypeSelect.uuid;
					if(ISAPP){
						this.oNotesContent.info.data.title=HtmlUtil.htmlEncode(this.oNotesContent.info.data.title);
						this.oNotesContent.info.data.content=HtmlUtil.htmlEncode(this.oNotesContent.info.data.content);
						window.external.dataInsert("notes",JSON.stringify(this.oNotesContent.info.data))
					}else{
						this.oNotesContent.list.push(this.oNotesContent.info.data);
					}
				}else if(this.oNotesContent.info.type==="modify"){
					delete this.oNotesContent.info.data.oldTitle;
					delete this.oNotesContent.info.data.oldContent;					
					
					this.oNotesContent.info.data.modifyTime=Date.now();
					this.oNotesContent.info.data.typeUuid=this.oNotesType.notesTypeSelect.uuid;
					
					_index=this.getNotesContentIndex(this.oNotesContent.info.data.uuid);
					
					if(_index!==-1){
						if(ISAPP){
							this.oNotesContent.info.data.title=HtmlUtil.htmlEncode(this.oNotesContent.info.data.title);
							this.oNotesContent.info.data.content=HtmlUtil.htmlEncode(this.oNotesContent.info.data.content);
							window.external.dataUpdate("notes",JSON.stringify(this.oNotesContent.info.data))
						}else{
							this.oNotesContent.list.splice(_index,1,this.oNotesContent.info.data);
						}
					}
					
					
				}
				this.hideNotesContent(false);
			},
			//记事内容 检测
			checkNotesContent:function(){
				var title=this.oNotesContent.info.data.title;
				var content=this.oNotesContent.info.data.content;
				if(title===""){
					if(content===""){
						title="此处添加记事标题";
						content="未添加记事详情";
					}else{
						title=content
					}
				}
				this.oNotesContent.info.data.title=title;
				this.oNotesContent.info.data.content=content;
			},
			//更新记事内容
			upNotesContent:function(data){
				data=HtmlUtil.htmlDecode(data);
				var typeDate=JSON.parse(data);
				this.oNotesContent.list=typeDate;
			}
		},
		mounted:function(){
			this.$nextTick(function(){
				if(ISAPP){
					window.external.dataSelect("notes");
				}
			});
		}
	};
	//记事类别逻辑
	var comNotesType={
		data:{
			//类别数据 
			oNotesType:{
				list:[],
				info:{
					type:"add",
					show:false,
					index:null,
					data:{
						addTime:null,
						modifyTime:null,
						text:"",
						uuid:""
					},
					error:""
				},
				active:-1,
				notesTypeSelect:{uuid:"",text:""},
				showTypeList:false
			}
		},
		methods:{
			//类别列表显示及隐藏
			toggleTypeList:function(bFlag){
				clearTimeout(this.toggleTypeList.timer)
				if(!bFlag){
					this.toggleTypeList.timer=setTimeout(function(){
						this.oNotesType.showTypeList=bFlag;
					}.bind(this),100)
				}else{
					this.oNotesType.showTypeList=bFlag;
				}
			},
			//类别切换
			tabNotesType:function(index){
				if(index===-1){
					this.setNotesTypeSelect(this.oNotesType.list[0].uuid,this.oNotesType.list[0].text,index)
					
				}else{
					this.setNotesTypeSelect(this.oNotesType.list[index].uuid,this.oNotesType.list[index].text,index);
				}
				
			},
			//类别列表选择
			setNotesTypeSelect:function(uuid,text,index){
				this.oNotesType.notesTypeSelect.uuid=uuid;
				this.oNotesType.notesTypeSelect.text=text;
				this.oNotesType.active=index;
			},
			//设置类别选中信息
			setNotesTypeInfo:function(index,value){
				this.oNotesType.info.index=index;
				this.oNotesType.info.data=extend({},value);
			},
			//显示类别表单
			showNotesType:function(){
				this.oNotesType.info.show=true;
			},
			//隐藏类别表单
			hideNotesType:function(){
				this.oNotesType.info.show=false;
				this.setNotesTypeInfo(null,{
					addTime:null,
					modifyTime:null,
					text:"",
					uuid:""
				});
			},
			//增 类别
			addNotesType:function(){
				this.oNotesType.info.type="add";
				this.showNotesType();
				
				this.setNotesTypeInfo(null,{
					addTime:null,
					modifyTime:null,
					text:"",
					uuid:""
				});
				this.$nextTick(function(){
					this.$refs.typeInp.focus();
				});
				console.log("add");
			},
			//改 类别
			modifyNotesType:function(){
				this.oNotesType.info.type="modify";
				this.showNotesType();
				this.$nextTick(function(){
					this.$refs.typeInp.focus();
					this.$refs.typeInp.select();
				});
				console.log("modify");
			},
			//删 类别
			delNotesType:function(index){
				this.hideContextMenu();
				setTimeout(function(){
					if(this.oNotesType.list.length===1){
						alert("至少保留一个记事分类");
						return;
					}
					var _flag=confirm("删除此分类会同时删除此分类下的所有记事信息\n确认要删除此分类吗？")
					if(_flag){
						delete NOTES_TYPE_MAP[this.oNotesType.info.data.text];
						
						this.oNotesType.list.splice(this.oNotesType.info.index,1);
						
						ISAPP && window.external.dataDelete("type",this.oNotesType.info.data.uuid);
						
						if(this.oNotesType.active>=this.oNotesType.list.length){
							this.tabNotesType(this.oNotesType.list.length-1);
						}
						this.tabNotesType(this.oNotesType.active);
						
						this.delNotesContents(this.oNotesType.info.data.uuid);
						console.log("del");
					}
				}.bind(this),50)
				
				
			},
			//存 类别
			saveNotesType:function(){
				var _map_key=this.oNotesType.list[this.oNotesType.info.index]&&this.oNotesType.list[this.oNotesType.info.index].text;
				
				
				if(this.oNotesType.info.data.text===""){
					return;
				}
				
				if(NOTES_TYPE_MAP[this.oNotesType.info.data.text]){
					if(this.oNotesType.info.type==="modify"&&_map_key!==this.oNotesType.info.data.text){
						this.oNotesType.info.error="已添加此分类";
						return;
					}
					if(this.oNotesType.info.type==="add"){
						this.oNotesType.info.error="已添加此分类";
						return;
					}
				}
				
				delete NOTES_TYPE_MAP[_map_key];
				NOTES_TYPE_MAP[this.oNotesType.info.data.text]=true;
				
				if(this.oNotesType.info.type==="add"){
					NOTES_TYPE_MAP[this.oNotesType.info.data.text]=true;
					this.oNotesType.info.data.addTime=Date.now();
					this.oNotesType.info.data.modifyTime=Date.now();
					this.oNotesType.info.data.uuid=this.getUuid();
					this.oNotesType.list.push(this.oNotesType.info.data);
					if(ISAPP){
						//this.oNotesType.info.data.text=HtmlUtil.htmlEncode(this.oNotesType.info.data.text);
						window.external.dataInsert("type",JSON.stringify(this.oNotesType.info.data))
					}
					
				}else if(this.oNotesType.info.type==="modify"){
					this.oNotesType.info.data.modifyTime=Date.now();
					this.oNotesType.list.splice(this.oNotesType.info.index,1,this.oNotesType.info.data);
					if(ISAPP){
						//this.oNotesType.info.data.text=HtmlUtil.htmlEncode(this.oNotesType.info.data.text);
						window.external.dataUpdate("type",JSON.stringify(this.oNotesType.info.data))
					}
				}
				this.hideNotesType();
			},
			//类别转换 做唯一校验
			transformNotesType:function(){
				this.oNotesType.list.forEach(function(v,i){
					NOTES_TYPE_MAP[v.text]=true;
				}.bind(this))
			},
			//更新记事类别
			upNotesType:function(data){
				//data=HtmlUtil.htmlDecode(data);
				var typeDate=JSON.parse(data);
				this.oNotesType.list=typeDate;
				this.transformNotesType();
			},
			delNotesContents:function(uuid){
				var _uids=[];
				
				this.oNotesContent.list.forEach(function(v,i){
					if(v.typeUuid===uuid){
						_uids.push(v.uuid);
					};
				}.bind(this));
				
				if(ISAPP){
					var _sJson=JSON.stringify(_uids);
					window.external.dataDelete("notes",_sJson);
				}else{
					_uids.forEach(function(v,i){
						var _index=this.getNotesContentIndex(v);
						this.oNotesContent.list.splice(_index,1);
					}.bind(this))
				}
				
				console.log("content-delete");
				
			}
		},
		mounted:function(){
			this.$nextTick(function(){
				if(ISAPP){
					window.external.dataSelect("type");
				}else{
					this.oNotesType.list=[{uuid:"0",text:"工作",addTime:Date.now(),modifyTime:Date.now()}]
					this.transformNotesType()
				};
				this.tabNotesType(-1);
			});
		}
	}
	
	//初始化
	window.NOTES = new Vue({
		el:"#app",
		data:{
			title:"记事本",			
		},
		mixins:[comContentMenu,comNotesType,comNotesContent,directives],
		methods:{
			evMainClick:function(){
				this.hideContextMenu();
			},
			evHeadDown:function(){
				this.hideContextMenu();
			},
			getUuid:function(){
				return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
					var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
					return v.toString(16);
				});
			}
		},
		mounted:function(){
			this.$nextTick(function(){
				var _this=this;
				if(ISAPP){
					window.external.showWin();
				}
				window.onblur=function(){
					_this.hideContextMenu();
				}
			}.bind(this));
			
		}
	});
}();
