'use strict';
game.import('card',function(lib,game,ui,get,ai,_status){
	return {
		name:'standard',
		connect:true,
		card:{
			damage:{
				ai:{
					result:{
						target:-1.5
					},
					tag:{
						damage:1
					}
				}
			},
			recover:{
				ai:{
					result:{
						target:1.5
					},
					tag:{
						recover:1
					}
				}
			},
			firedamage:{
				ai:{
					result:{
						target:-1.5
					},
					tag:{
						damage:1,
						fireDamage:1,
						natureDamage:1,
					}
				}
			},
			thunderdamage:{
				ai:{
					result:{
						target:-1.5
					},
					tag:{
						damage:1,
						thunderDamage:1,
						natureDamage:1,
					}
				}
			},
			respondShan:{
				ai:{
					result:{
						target:-1.5,
					},
					tag:{
						respond:1,
						respondShan:1,
						damage:1
					}
				}
			},
			sha:{
				audio:true,
				fullskin:true,
				nature:['thunder','fire'],
				type:'basic',
				enable:true,
				usable:1,
				range:{attack:1},
				selectTarget:1,
				filterTarget:function(card,player,target){return player!=target},
				content:function(){
					"step 0"
					if(typeof event.shanRequired!='number'||!event.shanRequired||event.shanRequired<0){
						event.shanRequired=1;
					}
					"step 1"
					if(event.skipShan){
						event._result={bool:true};
					}
					else if(event.directHit){
						event._result={bool:false};
					}
					else{
						var next=target.chooseToRespond({name:'shan'});
						if(event.shanRequired>1){
							next.set('prompt2','（共需打出张'+event.shanRequired+'闪）');
						}
						next.set('ai',function(card){
							var target=_status.event.player;
							var evt=_status.event.getParent();
							if(target.countCards('h','shan')<_status.event.shanRequired){
								return -1
							}
							if(target.hasSkillTag('useShan')){
								return 11-get.value(card);
							}
							if(get.damageEffect(target,evt.player,target,evt.card.nature)>=0) return -1;
							return 11-get.value(card);
						}).set('shanRequired',event.shanRequired);
						next.autochoose=lib.filter.autoRespondShan;
					}
					"step 2"
					if(result.bool==false){
						event.trigger('shaHit');
					}
					else{
						event.shanRequired--;
						if(event.shanRequired>0){
							event.goto(1);
						}
						else{
							event.trigger('shaMiss');
							event.responded=result;
						}
					}
					"step 3"
					if(result.bool==false&&!event.unhurt){
						target.damage(get.nature(event.card));
						event.result={bool:true}
						event.trigger('shaDamage');
					}
					else{
						event.result={bool:false}
						event.trigger('shaUnhirt');
					}
				},
				ai:{
					basic:{
						useful:[5,1],
						value:[5,1],
					},
					order:function(){
						if(_status.event.player.hasSkillTag('presha',true,null,true)) return 10;
						return 3;
					},
					result:{
						target:function(player,target){
							if(player.hasSkill('jiu')&&!target.getEquip('baiyin')){
								if(get.attitude(player,target)>0){
									return -6;
								}
								else{
									return -3;
								}
							}
							return -1.5;
						},
					},
					tag:{
						respond:1,
						respondShan:1,
						damage:function(card){
							if(card.nature=='poison') return;
							return 1;
						},
						natureDamage:function(card){
							if(card.nature) return 1;
						},
						fireDamage:function(card,nature){
							if(card.nature=='fire') return 1;
						},
						thunderDamage:function(card,nature){
							if(card.nature=='thunder') return 1;
						},
						poisonDamage:function(card,nature){
							if(card.nature=='poison') return 1;
						}
					}
				}
			},
			shacopy:{
				ai:{
					basic:{
						useful:[5,1],
						value:[5,1],
					},
					order:3,
					result:{
						target:-1.5,
					},
					tag:{
						respond:1,
						respondShan:1,
						damage:function(card){
							if(card.nature=='poison') return;
							return 1;
						},
						natureDamage:function(card){
							if(card.nature) return 1;
						},
						fireDamage:function(card,nature){
							if(card.nature=='fire') return 1;
						},
						thunderDamage:function(card,nature){
							if(card.nature=='thunder') return 1;
						},
						poisonDamage:function(card,nature){
							if(card.nature=='poison') return 1;
						}
					}
				}
			},
			shan:{
				audio:true,
				fullskin:true,
				type:'basic',
				cardcolor:'red',
				ai:{
					basic:{
						useful:[7,2],
						value:[7,2]
					}
				}
			},
			tao:{
				fullskin:true,
				type:'basic',
				cardcolor:'red',
				toself:true,
				enable:function(card,player){
					return player.hp<player.maxHp;
				},
				savable:true,
				selectTarget:-1,
				filterTarget:function(card,player,target){
					return target==player&&target.hp<target.maxHp;
				},
				modTarget:function(card,player,target){
					return target.hp<target.maxHp;
				},
				content:function(){
					target.recover();
				},
				ai:{
					basic:{
						order:function(card,player){
							if(player.hasSkillTag('pretao')) return 5;
							return 2;
						},
						useful:[8,6.5,5,4],
						value:[8,6.5,5,4],
					},
					result:{
						target:function(player,target){
							// if(player==target&&player.hp<=0) return 2;
							var nd=player.needsToDiscard();
							var keep=false;
							if(nd<=0){
								keep=true;
							}
							else if(nd==1&&target.hp>=2&&target.countCards('h','tao')<=1){
								keep=true;
							}
							var mode=get.mode();
							if(target.hp>=2&&keep&&target.hasFriend()){
								if(target.hp>2||nd==0) return 0;
								if(target.hp==2){
									if(game.hasPlayer(function(current){
										if(target!=current&&get.attitude(target,current)>=3){
											if(current.hp<=1) return true;
											if((mode=='identity'||mode=='versus'||mode=='chess')&&current.identity=='zhu'&&current.hp<=2) return true;
										}
									})){
										return 0;
									}
								}
							}
							if(target.hp<0&&target!=player&&target.identity!='zhu') return 0;
							var att=get.attitude(player,target);
							if(att<3&&att>=0&&player!=target) return 0;
							var tri=_status.event.getTrigger();
							if(mode=='identity'&&player.identity=='fan'&&target.identity=='fan'){
								if(tri&&tri.name=='dying'&&tri.source&&tri.source.identity=='fan'&&tri.source!=target){
									var num=game.countPlayer(function(current){
										if(current.identity=='fan'){
											return current.countCards('h','tao');
										}
									});
									if(num>1&&player==target) return 2;
									return 0;
								}
							}
							if(mode=='identity'&&player.identity=='zhu'&&target.identity=='nei'){
								if(tri&&tri.name=='dying'&&tri.source&&tri.source.identity=='zhong'){
									return 0;
								}
							}
							if(mode=='stone'&&target.isMin()&&
							player!=target&&tri&&tri.name=='dying'&&player.side==target.side&&
							tri.source!=target.getEnemy()){
								return 0;
							}
							return 2;
						},
					},
					tag:{
						recover:1,
						save:1,
					}
				}
			},
			bagua:{
				fullskin:true,
				type:'equip',
				subtype:'equip2',
				ai:{
					basic:{
						equipValue:7.5
					}
				},
				skills:['bagua_skill']
			},
			jueying:{
				fullskin:true,
				type:'equip',
				subtype:'equip3',
				distance:{globalTo:1},
			},
			dilu:{
				fullskin:true,
				type:'equip',
				subtype:'equip3',
				distance:{globalTo:1},
			},
			zhuahuang:{
				fullskin:true,
				type:'equip',
				subtype:'equip3',
				distance:{globalTo:1},
			},
			chitu:{
				fullskin:true,
				type:'equip',
				subtype:'equip4',
				distance:{globalFrom:-1},
			},
			dawan:{
				fullskin:true,
				type:'equip',
				subtype:'equip4',
				distance:{globalFrom:-1},
			},
			zixin:{
				fullskin:true,
				type:'equip',
				subtype:'equip4',
				distance:{globalFrom:-1},
			},
			zhuge:{
				fullskin:true,
				type:'equip',
				subtype:'equip1',
				ai:{
					equipValue:function(card,player){
						if(!game.hasPlayer(function(current){
							return player.canUse('sha',current)&&get.effect(current,{name:'sha'},player,player)<0;
						})){
							return 1;
						}
						if(player.hasSha()&&_status.currentPhase==player){
							if(player.getEquip('zhuge')||player.getCardUsable('sha')==0){
								return 10;
							}
						}
						var num=player.countCards('h','sha');
						if(num>1) return 4+num;
						return 2+num;
					},
					basic:{
						equipValue:5
					},
					tag:{
						valueswap:1
					}
				},
				skills:['zhuge_skill']
			},
			cixiong:{
				fullskin:true,
				type:'equip',
				subtype:'equip1',
				distance:{attackFrom:-1},
				ai:{
					basic:{
						equipValue:2
					}
				},
				skills:['cixiong_skill']
			},
			qinggang:{
				fullskin:true,
				type:'equip',
				subtype:'equip1',
				distance:{attackFrom:-1},
				ai:{
					basic:{
						equipValue:2
					}
				},
				skills:['qinggang_skill']
			},
			qinglong:{
				fullskin:true,
				type:'equip',
				subtype:'equip1',
				distance:{attackFrom:-2},
				ai:{
					equipValue:function(card,player){
						return Math.min(2.5+player.countCards('h','sha'),4);
					},
					basic:{
						equipValue:3.5
					}
				},
				skills:['qinglong_skill']
			},
			zhangba:{
				fullskin:true,
				type:'equip',
				subtype:'equip1',
				distance:{attackFrom:-2},
				ai:{
					equipValue:function(card,player){
						var num=2.5+player.countCards('h')/3;
						return Math.min(num,4);
					},
					basic:{
						equipValue:3.5
					}
				},
				skills:['zhangba_skill']
			},
			guanshi:{
				fullskin:true,
				type:'equip',
				subtype:'equip1',
				distance:{attackFrom:-2},
				ai:{
					equipValue:function(card,player){
						var num=2.5+(player.countCards('h')+player.countCards('e'))/2.5;
						return Math.min(num,5);
					},
					basic:{
						equipValue:4.5,
					}
				},
				skills:['guanshi_skill']
			},
			fangtian:{
				fullskin:true,
				type:'equip',
				subtype:'equip1',
				distance:{attackFrom:-3},
				ai:{
					basic:{
						equipValue:2.5
					}
				},
				skills:['fangtian_skill']
			},
			qilin:{
				fullskin:true,
				type:'equip',
				subtype:'equip1',
				distance:{attackFrom:-4},
				ai:{
					basic:{
						equipValue:3
					}
				},
				skills:['qilin_skill']
			},
			wugu:{
				audio:true,
				fullskin:true,
				type:'trick',
				enable:true,
				cardcolor:'red',
				selectTarget:-1,
				filterTarget:true,
				contentBefore:function(){
					"step 0"
					game.delay();
					"step 1"
					if(get.is.versus()){
						player.chooseControl('顺时针','逆时针',function(event,player){
							if(player.next.side==player.side) return '逆时针';
							return '顺时针';
						}).set('prompt','选择'+get.translation(card)+'的结算方向');
					}
					else{
						event.goto(3);
					}
					"step 2"
					if(result&&result.control=='顺时针'){
						var evt=event.getParent();
						evt.fixedSeat=true;
						evt.targets.sortBySeat();
						evt.targets.reverse();
						if(evt.targets[evt.targets.length-1]==player){
							evt.targets.unshift(evt.targets.pop());
						}
					}
					"step 3"
					ui.clear();
					var num;
					if(event.getParent().stocktargets){
						num=event.getParent().stocktargets.length;
					}
					else{
						num=game.countPlayer();
					}
					var cards=get.cards(num);
					var dialog=ui.create.dialog('五谷丰登',cards,true);
					_status.dieClose.push(dialog);
					dialog.videoId=lib.status.videoId++;
					game.addVideo('cardDialog',null,['五谷丰登',get.cardsInfo(cards),dialog.videoId]);
					event.getParent().preResult=dialog.videoId;
					game.broadcast(function(cards,id){
						var dialog=ui.create.dialog('五谷丰登',cards,true);
						_status.dieClose.push(dialog);
						dialog.videoId=id;
					},cards,dialog.videoId);
				},
				content:function(){
					"step 0"
					for(var i=0;i<ui.dialogs.length;i++){
						if(ui.dialogs[i].videoId==event.preResult){
							event.dialog=ui.dialogs[i];break;
						}
					}
					if(!event.dialog){
						event.finish();
						return;
					}
					if(event.dialog.buttons.length>1){
						var next=target.chooseButton(true,function(button){
							return get.value(button.link,_status.event.player);
						});
						next.set('dialog',event.preResult);
						next.set('closeDialog',false);
						next.set('dialogdisplay',true);
					}
					else{
						event.directButton=event.dialog.buttons[0];
					}
					"step 1"
					var dialog=event.dialog;
					var card;
					if(event.directButton){
						card=event.directButton.link;
					}
					else{
						card=result.links[0];
					}

					var button;
					for(var i=0;i<dialog.buttons.length;i++){
						if(dialog.buttons[i].link==card){
							button=dialog.buttons[i];
							button.querySelector('.info').innerHTML=get.translation(target.name);
							dialog.buttons.remove(button);
							break;
						}
					}
					var capt=get.translation(target)+'选择了'+get.translation(button.link);
					if(card){
						target.gain(card);
						target.$gain2(card);
						game.broadcast(function(card,id,name,capt){
							var dialog=get.idDialog(id);
							if(dialog){
								dialog.content.firstChild.innerHTML=capt;
								for(var i=0;i<dialog.buttons.length;i++){
									if(dialog.buttons[i].link==card){
										dialog.buttons[i].querySelector('.info').innerHTML=name;
										dialog.buttons.splice(i--,1);
										break;
									}
								}
							}
						},card,dialog.videoId,get.translation(target.name),capt);
					}
					dialog.content.firstChild.innerHTML=capt;
					game.addVideo('dialogCapt',null,[dialog.videoId,dialog.content.firstChild.innerHTML]);
					game.log(target,'选择了',button.link);
					game.delay();
				},
				contentAfter:function(){
					for(var i=0;i<ui.dialogs.length;i++){
						if(ui.dialogs[i].videoId==event.preResult){
							var dialog=ui.dialogs[i];
							dialog.close();
							_status.dieClose.remove(dialog);
							if(dialog.buttons.length){
								event.remained=[];
								for(var i=0;i<dialog.buttons.length;i++){
									event.remained.push(dialog.buttons[i].link);
								}
								event.trigger('wuguRemained');
							}
							break;
						}
					}
					game.broadcast(function(id){
						var dialog=get.idDialog(id);
						if(dialog){
							dialog.close();
							_status.dieClose.remove(dialog);
						}
					},event.preResult);
					game.addVideo('cardDialog',null,event.preResult);
				},
				ai:{
					wuxie:function(){
						if(Math.random()<0.5) return 0;
					},
					basic:{
						order:3,
						useful:1,
					},
					result:{
						target:function(player,target){
							if(get.is.versus()){
								if(target==player) return 1.5;
								return 1;
							}
							if(player.hasUnknown(2)){
								return 0;
							}
							return 2-2*get.distance(player,target,'absolute')/game.countPlayer();
						}
					},
					tag:{
						draw:1,
						multitarget:1
					}
				}
			},
			taoyuan:{
				audio:true,
				fullskin:true,
				type:'trick',
				enable:true,
				selectTarget:-1,
				reverseOrder:true,
				filterTarget:function(card,player,target){
					return target.hp<target.maxHp;
				},
				content:function(){
					target.recover();
				},
				ai:{
					basic:{
						order:9,
						useful:[3,1],
						value:0
					},
					result:{
						target:function(player,target){
							return (target.hp<target.maxHp)?2:0;
						}
					},
					tag:{
						recover:0.5,
						multitarget:1
					}
				}
			},
			nanman:{
				audio:true,
				fullskin:true,
				type:'trick',
				enable:true,
				selectTarget:-1,
				filterTarget:function(card,player,target){
					return target!=player;
				},
				reverseOrder:true,
				content:function(){
					"step 0"
					var next=target.chooseToRespond({name:'sha'});
					next.set('ai',function(card){
						var evt=_status.event.getParent();
						if(get.damageEffect(evt.target,evt.player,evt.target)>=0) return 0;
						if(evt.player.hasSkillTag('notricksource')) return 0;
						if(evt.target.hasSkillTag('notrick')) return 0;
						return 11-get.value(card);
					});
					next.autochoose=lib.filter.autoRespondSha;
					"step 1"
					if(result.bool==false){
						target.damage();
					}
				},
				ai:{
					wuxie:function(target,card,player,viewer){
						if(get.attitude(viewer,target)>0&&target.countCards('h','sha')){
							if(!target.countCards('h')||target.hp==1||Math.random()<0.7) return 0;
						}
					},
					basic:{
						order:9,
						useful:[5,1],
						value:5
					},
					result:{
						target:function(player,target){
							if(player.hasUnknown(2)&&get.mode()!='guozhan') return 0;
							var nh=target.countCards('h');
							if(get.mode()=='identity'){
								if(target.isZhu&&nh<=2&&target.hp<=1) return -100;
							}
							if(nh==0) return -2;
							if(nh==1) return -1.7
							return -1.5;
						},
					},
					tag:{
						respond:1,
						respondSha:1,
						damage:1,
						multitarget:1,
						multineg:1,
					}
				}
			},
			wanjian:{
				audio:true,
				fullskin:true,
				type:'trick',
				enable:true,
				selectTarget:-1,
				reverseOrder:true,
				filterTarget:function(card,player,target){
					return target!=player;
				},
				content:function(){
					"step 0"
					var next=target.chooseToRespond({name:'shan'});
					next.set('ai',function(card){
						var evt=_status.event.getParent();
						if(get.damageEffect(evt.target,evt.player,evt.target)>=0) return 0;
						if(evt.player.hasSkillTag('notricksource')) return 0;
						if(evt.target.hasSkillTag('notrick')) return 0;
						return 11-get.value(card);
					});
					next.autochoose=lib.filter.autoRespondShan;
					"step 1"
					if(result.bool==false){
						target.damage();
					}
				},
				ai:{
					wuxie:function(target,card,player,viewer){
						if(get.attitude(viewer,target)>0&&target.countCards('h','shan')){
							if(!target.countCards('h')||target.hp==1||Math.random()<0.7) return 0;
						}
					},
					basic:{
						order:9,
						useful:1,
						value:5
					},
					result:{
						target:function(player,target){
							if(player.hasUnknown(2)&&get.mode()!='guozhan') return 0;
							var nh=target.countCards('h');
							if(get.mode()=='identity'){
								if(target.isZhu&&nh<=2&&target.hp<=1) return -100;
							}
							if(nh==0) return -2;
							if(nh==1) return -1.7
							return -1.5;
						},
					},
					tag:{
						respond:1,
						respondShan:1,
						damage:1,
						multitarget:1,
						multineg:1,
					}
				}
			},
			wuzhong:{
				audio:true,
				fullskin:true,
				type:'trick',
				enable:true,
				selectTarget:-1,
				cardcolor:'red',
				toself:true,
				filterTarget:function(card,player,target){
					return target==player;
				},
				modTarget:true,
				content:function(){
					if(get.is.versus()){
						if(game.friend.contains(target)){
							if(game.friend.length<game.enemy.length){
								target.draw(3);return;
							}
						}
						else{
							if(game.friend.length>game.enemy.length){
								target.draw(3);return;
							}
						}
					}
					target.draw(2);
				},
				ai:{
					basic:{
						order:7.2,
						useful:4.5,
						value:9.2
					},
					result:{
						target:2,
					},
					tag:{
						draw:2
					}
				}
			},
			juedou:{
				audio:true,
				fullskin:true,
				type:'trick',
				enable:true,
				filterTarget:function(card,player,target){
					return target!=player;
				},
				content:function(){
					"step 0"
					if(event.turn==undefined) event.turn=target;
					"step 1"
					event.trigger('juedou');
					"step 2"
					if(event.directHit){
						event._result={bool:false};
					}
					else{
						var next=event.turn.chooseToRespond({name:'sha'});
						next.set('ai',function(card){
							var event=_status.event;
							var player=event.splayer;
							var target=event.starget;
							if(player.hasSkillTag('notricksource')) return 0;
							if(target.hasSkillTag('notrick')) return 0;
							if(event.player==target){
								if(player.hasSkill('naman')) return -1;
								if(get.attitude(target,player)<0||event.player.hp<=1){
									return get.unuseful2(card)
								}
								return -1;
							}
							else{
								if(target.hasSkill('naman')) return -1;
								if(get.attitude(player,target)<0||event.player.hp<=1){
									return get.unuseful2(card)
								}
								return -1;
							}
						});
						next.set('splayer',player);
						next.set('starget',target);
						next.autochoose=lib.filter.autoRespondSha;
						if(event.turn==target){
							next.source=player;
						}
						else{
							next.source=target;
						}
					}
					"step 3"
					if(event.target.isDead()||event.player.isDead()){
						event.finish();
					}
					else{
						if(result.bool){
							if(event.turn==target) event.turn=player;
							else event.turn=target;
							event.goto(1);
						}
						else{
							if(event.turn==target){
								target.damage();
							}
							else{
								player.damage(target);
							}
						}
					}
				},
				ai:{
					basic:{
						order:5,
						useful:1,
						value:4.5
					},
					result:{
						target:-1.5,
						player:function(player,target){
							if(get.damageEffect(target,player,target)>0&&get.attitude(player,target)>0&&get.attitude(target,player)>0){
								return 0;
							}
							var hs1=target.getCards('h','sha');
							var hs2=player.getCards('h','sha');
							if(hs1.length>hs2.length+1){
								return -2;
							}
							var hsx=target.getCards('h');
							if(hsx.length>2&&hs2.length==0&&hsx[0].number<6){
								return -2;
							}
							if(hsx.length>3&&hs2.length==0){
								return -2;
							}
							if(hs1.length>hs2.length&&(!hs2.length||hs1[0].number>hs2[0].number)){
								return -2;
							}
							return -0.5;
						}
					},
					tag:{
						respond:2,
						respondSha:2,
						damage:1,
					}
				}
			},
			shunshou:{
				audio:true,
				fullskin:true,
				type:'trick',
				enable:true,
				range:{global:1},
				selectTarget:1,
				postAi:function(targets){
					return targets.length==1&&targets[0].countCards('j');
				},
				filterTarget:function(card,player,target){
					if(player==target) return false;
					return (target.countCards('hej')>0);
				},
				content:function(){
					if(target.countCards('hej')){
						player.gainPlayerCard('hej',target,true);
					}
				},
				ai:{
					wuxie:function(target,card,player,viewer){
						if(get.attitude(viewer,player)>0&&get.attitude(viewer,target)>0){
							return 0;
						}
					},
					basic:{
						order:7.5,
						useful:4,
						value:9
					},
					result:{
						target:function(player,target){
							if(get.attitude(player,target)<=0) return (target.countCards('he')>0)?-1.5:1.5;
							var js=target.getCards('j');
							if(js.length){
								var jj=js[0].viewAs?{name:js[0].viewAs}:js[0];
								if(jj.name=='shunshou') return 3;
								if(js.length==1&&get.effect(target,jj,target,player)>=0){
									return -1.5;
								}
								return 3;
							}
							return -1.5;
						},
						player:function(player,target){
							if(get.attitude(player,target)<0&&!target.countCards('he')){
								return 0;
							}
							if(get.attitude(player,target)>1){
								var js=target.getCards('j');
								if(js.length){
									var jj=js[0].viewAs?{name:js[0].viewAs}:js[0];
									if(jj.name=='shunshou') return 1;
									if(js.length==1&&get.effect(target,jj,target,player)>=0){
										return 0;
									}
									return 1;
								}
								return 0;
							}
							return 1;
						}
					},
					tag:{
						loseCard:1,
						gain:1,
					}
				}
			},
			guohe:{
				audio:true,
				fullskin:true,
				type:'trick',
				enable:true,
				selectTarget:1,
				postAi:function(targets){
					return targets.length==1&&targets[0].countCards('j');
				},
				filterTarget:function(card,player,target){
					if(player==target) return false;
					return (target.countCards('hej')>0);
				},
				content:function(){
					if(target.countCards('hej')){
						player.discardPlayerCard('hej',target,true);
					}
				},
				ai:{
					basic:{
						order:9,
						useful:1,
						value:5,
					},
					result:{
						target:function(player,target){
							var att=get.attitude(player,target);
							var nh=target.countCards('h');
							if(att>0){
								var js=target.getCards('j');
								if(js.length){
									var jj=js[0].viewAs?{name:js[0].viewAs}:js[0];
									if(jj.name=='guohe'||js.length>1||get.effect(target,jj,target,player)<0){
										return 2;
									}
								}
								if(target.getEquip('baiyin')&&target.isDamaged()&&
									get.recoverEffect(target,player,player)>0){
									if(target.hp==1&&!target.hujia) return 1.6;
									if(target.hp==2) return 0.01;
									return 0;
								}
							}
							var es=target.getCards('e');
							var noe=(es.length==0||target.hasSkillTag('noe'));
							var noe2=(es.length==1&&es[0].name=='baiyin'&&target.isDamaged());
							var noh=(nh==0||target.hasSkillTag('noh'));
							if(noh&&(noe||noe2)) return 0;
							if(att<=0&&!target.countCards('he')) return 1.5;
							return -1.5;
						},
					},
					tag:{
						loseCard:1,
						discard:1
					}
				}
			},
			jiedao:{
				audio:true,
				fullskin:true,
				type:'trick',
				enable:true,
				selectTarget:2,
				singleCard:true,
				multitarget:true,
				targetprompt:['被借刀','出杀目标'],
				complexTarget:true,
				filterTarget:function(card,player,target){
					if(ui.selected.targets.length==0){
						return (player!=target&&target.getCards('e',{subtype:'equip1'}).length);
					}
					else{
						return lib.filter.filterTarget({name:'sha'},ui.selected.targets[0],target);
					}
				},
				content:function(){
					"step 0"
					if(!target.hasSha()){
						event.directfalse=true;
					}
					else{
						target.chooseToUse('对'+get.translation(event.addedTarget)+'使用一张杀，或令'+get.translation(player)+'获得你的武器牌',
							{name:'sha'},event.addedTarget,-1).set('targetRequired',true);
					}
					"step 1"
					if(event.directfalse||result.bool==false){
						player.gain(targets[0].getCards('e',{subtype:'equip1'}),targets[0]);
						targets[0].$give(targets[0].getCards('e',{subtype:'equip1'}),player);
					}
				},
				ai:{
					basic:{
						order:8,
						value:2,
						useful:1,
					},
					result:{
						target:-1.5,
						player:function(player){
							if(player.getCards('he',{subtype:'equip1'}).length) return 0;
							return 1.5;
						},
					},
					tag:{
						gain:1,
						use:1,
						useSha:1,
						multitarget:1,
						multineg:1,
						loseCard:1,
					}
				}
			},
			wuxie:{
				audio:true,
				fullskin:true,
				type:'trick',
				ai:{
					basic:{
						useful:[6,4],
						value:[6,4],
					},
					result:{player:1},
					expose:0.2
				},
				notarget:true,
				content:function(){
					event.result='wuxied';
					if(player.isOnline()){
						player.send(function(player){
							if(ui.tempnowuxie&&!player.hasWuxie()){
								ui.tempnowuxie.close();
								delete ui.tempnowuxie;
							}
						},player);
					}
					else if(player==game.me){
						if(ui.tempnowuxie&&!player.hasWuxie()){
							ui.tempnowuxie.close();
							delete ui.tempnowuxie;
						}
					}
				},
			},
			lebu:{
				audio:true,
				fullskin:true,
				type:'delay',
				filterTarget:function(card,player,target){
					return (lib.filter.judge(card,player,target)&&player!=target);
				},
				judge:function(card){
					if(get.suit(card)=='heart') return 0;
					return -3;
				},
				effect:function(){
					if(result.bool==false){
						player.skip('phaseUse');
					}
				},
				ai:{
					basic:{
						order:1,
						useful:1,
						value:8,
					},
					result:{
						target:function(player,target){
							var num=target.hp-target.countCards('h')-2;
							if(num>-1) return -0.01;
							if(target.hp<3) num--;
							if(target.isTurnedOver()) num/=2;
							var dist=get.distance(player,target,'absolute');
							if(dist<1) dist=1;
							return num/Math.sqrt(dist);
						}
					},
					tag:{
						skip:'phaseUse'
					}
				}
			},
			shandian:{
				audio:true,
				fullskin:true,
				type:'delay',
				cardnature:'thunder',
				modTarget:function(card,player,target){
					return lib.filter.judge(card,player,target);
				},
				enable:function(card,player){
					return player.canAddJudge(card);
				},
				filterTarget:function(card,player,target){
					return (lib.filter.judge(card,player,target)&&player==target);
				},
				selectTarget:[-1,-1],
				judge:function(card){
					if(get.suit(card)=='spade'&&get.number(card)>1&&get.number(card)<10) return -6;
					return 0;
				},
				effect:function(){
					if(result.bool==false){
						player.damage(3,'thunder','nosource');
					}
					else{
						player.addJudgeNext(card);
					}
				},
				cancel:function(){
					player.addJudgeNext(card);
				},
				ai:{
					basic:{
						order:1,
						useful:0,
						value:0,
					},
					result:{
						target:function(player,target){
							var num=game.countPlayer(function(current){
								var skills=current.getSkills();
								for(var j=0;j<current.skills.length;j++){
									var rejudge=get.tag(current.skills[j],'rejudge',current);
									if(rejudge!=undefined){
										if(get.attitude(target,current)>0&&
										get.attitude(current,target)>0){
											return rejudge;
										}
										else{
											return -rejudge;
										}
									}
								}
							});
							if(num>0) return num;
							if(num==0){
								var mode=get.mode();
								if(mode=='identity'){
									if(target.identity=='nei') return 1;
									var situ=get.situation();
									if(target.identity=='fan'){
										if(situ>1) return 1;
									}
									else{
										if(situ<-1) return 1;
									}
								}
								else if(mode=='guozhan'){
									if(target.identity=='ye') return 1;
									if(game.hasPlayer(function(current){
										return current.identity=='unknown';
									})){
										return -1;
									}
									if(get.population(target.identity)==1){
										if(target.maxHp>2&&target.hp<2) return 1;
										if(game.countPlayer()<3) return -1;
										if(target.hp<=2&&target.countCards('he')<=3) return 1;
									}
								}
							}
							return -1;
						}
					},
					tag:{
						// damage:1,
						// natureDamage:1,
						// thunderDamage:1,
					}
				}
			},
			hanbing:{
				fullskin:true,
				type:"equip",
				subtype:"equip1",
				distance:{attackFrom:-1},
				skills:['hanbing_skill'],
				ai:{
					basic:{
						equipValue:2
					}
				},
			},
			renwang:{
				fullskin:true,
				type:"equip",
				subtype:"equip2",
				skills:['renwang_skill'],
				ai:{
					basic:{
						equipValue:7.5
					},
				},
			},
		},
		skill:{
			hanbing_skill:{
				trigger:{player:'shaHit'},
				direct:true,
				audio:true,
				filter:function(event){
					return event.target.getCards('he').length>0;
				},
				content:function(){
					"step 0"
					player.discardPlayerCard(get.prompt('hanbing'),'he',trigger.target,Math.min(2,trigger.target.countCards('he')),function(button){
						var trigger=_status.event.getTrigger();
						var player=_status.event.player;
						var eff=get.damageEffect(trigger.target,player,player);
						if(get.attitude(player,trigger.target)>0){
							if(eff>=0) return false;
							return 10-get.buttonValue(button);
						}
						if(eff<=0) return get.buttonValue(button);
						if(trigger.target.hp==1) return false;
						if(player.hasSkill('jiu')||player.hasSkill('tianxianjiu')||
						player.hasSkill('luoyi2')||player.hasSkill('reluoyi2')) return false;
						if(_status.event.dialog.buttons.length<2) return -1;
						var num=0;
						for(var i=0;i<_status.event.dialog.buttons.length;i++){
							if(get.buttonValue(_status.event.dialog.buttons[i])>1.5) num++;
						}
						if(num>=2) return get.buttonValue(button)-1.5;
					}).set('logSkill','hanbing_skill');
					"step 1"
					if(result.bool){
						trigger.untrigger();
						trigger.unhurt=true;
					}
				}
			},
			renwang_skill:{
				trigger:{target:'shaBefore'},
				forced:true,
				priority:6,
				audio:true,
				filter:function(event){
					if(event.player.hasSkillTag('unequip',false,event.card)) return false;
					return (event.card.name=='sha'&&get.color(event.card)=='black')
				},
				content:function(){
					trigger.untrigger();
					trigger.finish();
				},
				ai:{
					effect:{
						target:function(card,player){
							if(player.hasSkillTag('unequip',false,card)) return;
							if(card.name=='sha'&&get.color(card)=='black') return 'zerotarget';
						}
					}
				}
			},
			zhuge_skill:{
				mod:{
					cardUsable:function(card,player,num){
						if(card.name=='sha'){
							if(get.is.versus()){
								return num+3;
							}
							return Infinity;
						}
					}
				},
			},
			cixiong_skill:{
				trigger:{player:'shaBegin'},
				priority:5,
				audio:true,
				logTarget:'target',
				filter:function(event,player){
					if(player.sex=='male'&&event.target.sex=='female') return true;
					if(player.sex=='female'&&event.target.sex=='male') return true;
					return false;
				},
				content:function(){
					"step 0"
					trigger.target.chooseToDiscard('弃置一张手牌，或令'+get.translation(player)+'摸一张牌').set('ai',function(card){
						var trigger=_status.event.getTrigger();
						return -get.attitude(trigger.target,trigger.player)-get.value(card);
					});
					"step 1"
					if(result.bool==false) player.draw();
				}
			},
			qinggang_skill:{
				ai:{
					unequip:true,
					skillTagFilter:function(player,tag,arg){
						if(arg&&arg.name=='sha') return true;
						return false;
					}
				}
			},
			qinglong_skill:{
				trigger:{player:'shaMiss'},
				direct:true,
				filter:function(event,player){
					return player.canUse('sha',event.target)&&player.hasSha();
				},
				content:function(){
					"step 0"
					if(player.hasSkill('jiu')){
						game.broadcastAll(function(player){
							player.removeSkill('jiu');
						},player);
						event.jiu=true;
					}
					player.chooseToUse(get.prompt('qinglong'),{name:'sha'},trigger.target,-1).logSkill='qinglong_skill';
					"step 1"
					if(result.bool);
					else if(event.jiu){
						player.addSkill('jiu');
					}
				}
			},
			zhangba_skill:{
				enable:['chooseToUse','chooseToRespond'],
				filterCard:true,
				selectCard:2,
				position:'h',
				viewAs:{name:'sha'},
				filter:function(event,player){
					return player.countCards('h')>=2;
				},
				audio:true,
				prompt:'将两张手牌当杀使用或打出',
				check:function(card){
					if(card.name=='sha') return 0;
					return 6-get.useful(card)
				},
				ai:{
					respondSha:true,
					skillTagFilter:function(player){
						return player.countCards('h')>=2;
					},
				}
			},
			guanshi_skill:{
				trigger:{player:'shaMiss'},
				direct:true,
				audio:true,
				filter:function(event,player){
					return player.countCards('he')>2&&event.target.isAlive();
				},
				content:function(){
					"step 0"
					var next=player.chooseToDiscard(get.prompt('guanshi'),2,'he',function(card){
						return _status.event.player.getCards('e',{subtype:'equip1'}).contains(card)==false;
					});
					next.logSkill='guanshi_skill';
					next.set('ai',function(card){
						var evt=_status.event.getParent();
						if(get.attitude(evt.player,evt._trigger.target)<0){
							if(evt.player.hasSkill('jiu')||
							evt.player.hasSkill('tianxianjiu')||
							evt._trigger.target.hp==1){
								return 8-get.value(card)
							}
							return 5-get.value(card)
						}
						return -1;
					});
					"step 1"
					if(result.bool){
						trigger.untrigger();
						trigger.trigger('shaHit');
						trigger._result.bool=false;
					}
				}
			},
			fangtian_skill:{
				mod:{
					selectTarget:function(card,player,range){
						if(card.name!='sha') return;
						if(range[1]==-1) return;
						var cards=player.getCards('h');
						for(var i=0;i<cards.length;i++){
							if(cards[i].classList.contains('selected')==false)
								return;
						}
						range[1]+=2;
					}
				}
			},
			qilin_skill:{
				trigger:{player:'shaHit'},
				filter:function(event,player){
					return event.target.getCards('e',{subtype:['equip3','equip4']}).length>0
				},
				direct:true,
				audio:true,
				content:function(){
					"step 0"
					var att=(get.attitude(player,trigger.target)<=0);
					var next=player.chooseButton();
					next.set('att',att);
					next.set('createDialog',['选择要弃置的马',trigger.target.getCards('e',{subtype:['equip3','equip4']})]);
					next.set('ai',function(button){
						if(_status.event.att) return get.buttonValue(button);
						return 0;
					});
					"step 1"
					if(result.bool){
						player.logSkill('qilin_skill');
						trigger.target.discard(result.links[0]);
					}
				}
			},
			bagua_skill:{
				trigger:{player:'chooseToRespondBegin'},
				filter:function(event,player){
					if(event.responded) return false;
					if(!event.filterCard({name:'shan'})) return false;
					var evt=event.getParent();
					if(evt.player&&evt.player.hasSkillTag('unequip',false,evt.card)) return false;
					return true;
				},
				audio:true,
				check:function(event,player){
					if(get.damageEffect(player,event.player,player)>=0) return false;
					return true;
				},
				content:function(){
					"step 0"
					player.judge('bagua',function(card){return (get.color(card)=='red')?1.5:-0.5});
					"step 1"
					if(result.judge>0){
						trigger.untrigger();
						trigger.responded=true;
						trigger.result={bool:true,card:{name:'shan'}}
					}
				},
				ai:{
					effect:{
						target:function(card,player,target,effect){
							if(player.hasSkillTag('unequip',false,card)) return;
							if(get.tag(card,'respondShan')) return 0.5;
						}
					}
				}
			},
			_wuxie:{
				trigger:{player:['useCardToBefore','phaseJudge']},
				priority:5,
				popup:false,
				forced:true,
				filter:function(event,player){
					if(event.name!='phaseJudge'){
						var info=get.info(event.card);
						if(!event.target){
							if(info.wuxieable) return true;
							return false;
						}
						if(event.player.hasSkillTag('playernowuxie',false,event.card)) return false;
						if(get.type(event.card)!='trick'&&!info.wuxieable) return false;
					}
					return true;
				},
				content:function(){
					'step 0'
					if(trigger.multitarget){
						event.targets=trigger.targets;
					}
					event.target=trigger.target;
					if(event.triggername=='phaseJudge'){
						event.target=trigger.player;
					}
					event.sourcex=event.targets||event.target;
					if(!event.targets&&trigger.targets&&trigger.targets.length==1){
						event.sourcex2=trigger.player;
					}
					event.source=trigger.player;
					event.state=true;
					event.card=trigger.card;
					event._global_waiting=true;
					event.tempnowuxie=(trigger.targets&&trigger.targets.length>1&&!trigger.multitarget);
					event.filterCard=function(card,player){
						if(card.name!='wuxie') return false;
						return lib.filter.cardEnabled(card,player,'forceEnable');
					};
					event.send=function(player,state,isJudge,card,source,target,targets,id,id2,tempnowuxie,skillState){
						if(skillState){
							player.applySkills(skillState);
						}
						state=state?1:-1;
						var str='';
						if(isJudge){
							str+=get.translation(source)+'的';
						}
						if(isJudge){
							str+=get.translation(card,'viewAs');
						}
						else{
							str+=get.translation(card);
						}
						if((targets||target)&&!isJudge){
							str+='对'+get.translation(targets||target);
						}
						str+='将'+(state>0?'生效':'失效')+'，是否无懈？';

						if(player.isUnderControl(true)&&!_status.auto&&!ui.tempnowuxie&&tempnowuxie){
							var translation=get.translation(card.name);
							if(translation.length>=4){
								translation=lib.translate[card.name+'_ab']||translation.slice(0,2);
							}
							ui.tempnowuxie=ui.create.control('不无懈'+translation,ui.click.tempnowuxie,'stayleft');
							ui.tempnowuxie._origin=id2;
						}
						var next=player.chooseToUse({
							filterCard:function(card,player){
								if(card.name!='wuxie') return false;
								return lib.filter.cardEnabled(card,player,'forceEnable');
							},
							prompt:str,
							type:'wuxie',
							state:state,
							_global_waiting:true,
							ai1:function(){
								if(isJudge){
									var name=card.viewAs||card.name;
									var info=lib.card[name];
									if(info&&info.ai&&info.ai.wuxie){
										var aiii=info.ai.wuxie(source,card,source,_status.event.player,state);
										if(typeof aiii=='number') return aiii;
									}
									if(Math.abs(get.attitude(_status.event.player,source))<3) return 0;
									if(source.hasSkill('guanxing')) return 0;
									if(name!='lebu'&&name!='bingliang'){
										if(source!=_status.event.player){
											return 0;
										}
									}
									var card2;
									if(name!=card.name){
										card2={name:name};
									}
									else{
										card2=card;
									}
									var eff=get.effect(source,card2,source,source);
									if(eff>=0) return 0;
									return state*get.attitude(_status.event.player,source);
								}
								else{
									var triggerevent=_status.event.getTrigger();
									if(triggerevent&&triggerevent.parent&&
										triggerevent.parent.postAi&&
										triggerevent.player.isUnknown(_status.event.player)){
										return 0;
									}
									var info=get.info(card);
									if(info.ai&&info.ai.wuxie){
										var aiii=info.ai.wuxie(target,card,source,_status.event.player,state);
										if(typeof aiii=='number') return aiii;
									}
									if(info.multitarget&&targets){
										var eff=0;
										for(var i=0;i<targets.length;i++){
											eff+=get.effect(targets[i],card,source,_status.event.player)
										}
										return -eff*state;
									}
									if(Math.abs(get.attitude(_status.event.player,target))<3) return 0;
									return -get.effect(target,card,source,_status.event.player)*state;
								}
							},
							source:target,
							source2:targets,
							id:id,
							id2:id2
						});
						if(game.online){
							_status.event._resultid=id;
							game.resume();
						}
						else{
							next.nouse=true;
						}
					};
					'step 1'
					var list=game.filterPlayer(function(current){
						if(game.checkMod(trigger.card,player,trigger.target,current,'unchanged','wuxieEnabled',current)==false) return false;
						if(game.checkMod(trigger.card,player,trigger.target,current,'unchanged','wuxieRespondable',player)==false) return false;
						return current.hasWuxie();
					});
					event.list=list;
					event.id=get.id();
					list.sort(function(a,b){
						return get.distance(event.source,a,'absolute')-get.distance(event.source,b,'absolute');
					});
					'step 2'
					if(event.list.length==0){
						event.finish();
						if(!event.state){
							trigger.untrigger();
							if(event.triggername=='phaseJudge'){
								trigger.cancelled=true;
							}
							else{
								trigger.finish();
							}
						}
					}
					else if(_status.connectMode&&(event.list[0].isOnline()||event.list[0]==game.me)){
						event.goto(4);
					}
					else{
						event.current=event.list.shift();
						event.send(event.current,event.state,event.triggername=='phaseJudge',
						event.card,event.source,event.target,event.targets,event.id,trigger.parent.id,event.tempnowuxie);
					}
					'step 3'
					if(result.bool){
						event.wuxieresult=event.current;
						event.wuxieresult2=result;
						event.goto(8);
					}
					else{
						event.goto(2);
					}
					'step 4'
					var id=event.id;
					var sendback=function(result,player){
						if(result&&result.id==id&&!event.wuxieresult&&result.bool){
							event.wuxieresult=player;
							event.wuxieresult2=result;
							game.broadcast('cancel',id);
							if(_status.event.id==id&&_status.event.name=='chooseToUse'&&_status.paused){
								return (function(){
									event.resultOL=_status.event.resultOL;
									ui.click.cancel();
									if(ui.confirm) ui.confirm.close();
								});
							}
						}
						else{
							if(_status.event.id==id&&_status.event.name=='chooseToUse'&&_status.paused){
								return (function(){
									event.resultOL=_status.event.resultOL;
								});
							}
						}
					};

					var withme=false;
					var withol=false;
					var list=event.list;
					for(var i=0;i<list.length;i++){
						if(list[i].isOnline()){
							withol=true;
							list[i].wait(sendback);
							list[i].send(event.send,list[i],event.state,event.triggername=='phaseJudge',
							event.card,event.source,event.target,event.targets,event.id,trigger.parent.id,event.tempnowuxie,get.skillState(list[i]));
							list.splice(i--,1);
						}
						else if(list[i]==game.me){
							withme=true;
							event.send(list[i],event.state,event.triggername=='phaseJudge',
							event.card,event.source,event.target,event.targets,event.id,trigger.parent.id,event.tempnowuxie);
							list.splice(i--,1);
						}
					}
					if(!withme){
						event.goto(6);
					}
					if(_status.connectMode){
						if(withme||withol){
							for(var i=0;i<game.players.length;i++){
								game.players[i].showTimer();
							}
						}
					}
					event.withol=withol;
					'step 5'
					if(result&&result.bool&&!event.wuxieresult){
						game.broadcast('cancel',event.id);
						event.wuxieresult=game.me;
						event.wuxieresult2=result;
					}
					'step 6'
					if(event.withol&&!event.resultOL){
						game.pause();
					}
					'step 7'
					for(var i=0;i<game.players.length;i++){
						game.players[i].hideTimer();
					}
					'step 8'
					if(event.wuxieresult){
						event.wuxieresult.useResult(event.wuxieresult2);
					}
					'step 9'
					if(event.wuxieresult){
						if(result=='wuxied'){
							event.state=!event.state;
						}
						event.goto(1);
					}
					else if(event.list.length){
						event.goto(2);
					}
					else{
						if(!event.state){
							trigger.untrigger();
							if(event.triggername=='phaseJudge'){
								trigger.cancelled=true;
							}
							else{
								trigger.finish();
							}
						}
					}
					delete event.resultOL;
					delete event.wuxieresult;
					delete event.wuxieresult2;
				}
			},
		},
		translate:{
			sha:'杀',
			huosha:'火杀',
			leisha:'雷杀',
			shan:'闪',
			tao:'桃',
			bagua:'八卦阵',
			bagua_bg:'卦',
			bagua_skill:'八卦阵',
			jueying:'绝影',
			dilu:'的卢',
			zhuahuang:'爪黄飞电',
			jueying_bg:'+马',
			dilu_bg:'+马',
			zhuahuang_bg:'+马',
			chitu:'赤兔',
			chitu_bg:'-马',
			dawan:'大宛',
			dawan_bg:'-马',
			zixin:'紫骍',
			zixin_bg:'-马',
			zhuge:'诸葛连弩',
			cixiong:'雌雄双股剑',
			zhuge_bg:'弩',
			cixiong_bg:'双',
			qinggang:'青釭剑',
			qinglong:'青龙偃月刀',
			zhangba:'丈八蛇矛',
			qinglong_bg:'偃',
			zhangba_bg:'蛇',
			guanshi:'贯石斧',
			fangtian:'方天画戟',
			qilin:'麒麟弓',
			qilin_bg:'弓',
			zhuge_skill:'诸葛连弩',
			cixiong_skill:'雌雄双股剑',
			qinggang_skill:'青釭剑',
			qinglong_skill:'青龙偃月刀',
			zhangba_skill:'丈八蛇矛',
			guanshi_skill:'贯石斧',
			fangtian_skill:'方天画戟',
			qilin_skill:'麒麟弓',
			wugu:'五谷丰登',
			taoyuan:'桃园结义',
			nanman:'南蛮入侵',
			wanjian:'万箭齐发',
			wuzhong:'无中生有',
			juedou:'决斗',
			wugu_bg:'谷',
			taoyuan_bg:'园',
			nanman_bg:'蛮',
			wanjian_bg:'箭',
			wuzhong_bg:'生',
			juedou_bg:'斗',
			shunshou:'顺手牵羊',
			guohe:'过河拆桥',
			guohe_bg:'拆',
			jiedao:'借刀杀人',
			wuxie:'无懈可击',
			wuxie_bg:'懈',
			lebu:'乐不思蜀',
			shandian:'闪电',
			shandian_bg:'电',
			hanbing:'寒冰剑',
			renwang:'仁王盾',
			hanbing_bg:'冰',
			renwang_bg:'盾',
			hanbing_skill:'寒冰剑',
			renwang_skill:'仁王盾',
			hanbing_info:'每当你使用杀命中目标后，你可以防止伤害，改为弃置目标两张牌',
			hanbing_skill_info:'每当你使用杀命中目标后，你可以防止伤害，改为弃置目标两张牌',
			renwang_info:'黑色的杀对你无效',
			renwang_skill_info:'黑色的杀对你无效',
			sha_info:'出牌阶段，对攻击范围内的一名角色使用，令其打出一张【闪】或受到一点伤害。',
			shan_info:'闪避一张杀',
			tao_info:'出牌阶段，对自己使用，回复一点体力。',
			bagua_info:'每当你需要使用或打出一张【闪】时，你可以进行一次判定，若判定结果为红色，视为你使用或打出了一张【闪】。',
			bagua_skill_info:'每当你需要使用或打出一张【闪】时，你可以进行一次判定，若判定结果为红色，视为你使用或打出了一张【闪】。',
			jueying_info:'你的防御距离+1',
			dilu_info:'你的防御距离+1',
			zhuahuang_info:'你的防御距离+1',
			chitu_info:'你的进攻距离+1',
			dawan_info:'你的进攻距离+1',
			zixin_info:'你的进攻距离+1',
			zhuge_skill_info:'你于出牌阶段内使用【杀】无次数限制。',
			zhuge_info:'你于出牌阶段内使用【杀】无次数限制。',
			cixiong_skill_info:'每当你使用【杀】指定一名异性的目标角色后，你可以令其选择一项：1.弃置一张手牌；2.令你摸一张牌。',
			cixiong_info:'每当你使用【杀】指定一名异性的目标角色后，你可以令其选择一项：1.弃置一张手牌；2.令你摸一张牌。',
			qinggang_skill_info:'每当你使用【杀】指定一名目标角色后，你无视其防具。',
			qinggang_info:'每当你使用【杀】指定一名目标角色后，你无视其防具。',
			qinglong_skill_info:'每当你使用的【杀】被目标角色使用的【闪】抵消时，你可以对其使用一张【杀】（无距离限制）。',
			qinglong_info:'每当你使用的【杀】被目标角色使用的【闪】抵消时，你可以对其使用一张【杀】（无距离限制）。',
			zhangba_skill_info:'你可以将两张手牌当【杀】使用或打出。',
			zhangba_info:'你可以将两张手牌当【杀】使用或打出。',
			guanshi_skill_info:'每当你使用的【杀】被目标角色使用的【闪】抵消时，你可以弃置两张牌，令此【杀】依然对其造成伤害。',
			guanshi_info:'每当你使用的【杀】被目标角色使用的【闪】抵消时，你可以弃置两张牌，令此【杀】依然对其造成伤害。',
			fangtian_skill_info:'你使用的【杀】若是你最后的手牌，你可以额外选择至多两个目标。',
			fangtian_info:'你使用的【杀】若是你最后的手牌，你可以额外选择至多两个目标。',
			qilin_skill_info:'每当你使用【杀】对目标角色造成伤害时，你可以弃置其装备区里的一张坐骑牌。',
			qilin_info:'每当你使用【杀】对目标角色造成伤害时，你可以弃置其装备区里的一张坐骑牌。',
			wugu_info:'出牌阶段，对所有角色使用。（选择目标后）你从牌堆顶亮出等同于目标数量的牌，每名目标角色获得这些牌中（剩余的）的任意一张。',
			taoyuan_info:'出牌阶段，对所有角色使用。每名目标角色回复1点体力。',
			nanman_info:'出牌阶段，对所有其他角色使用。每名目标角色需打出一张【杀】，否则受到1点伤害。',
			wanjian_info:'出牌阶段，对所有其他角色使用。每名目标角色需打出一张【闪】，否则受到1点伤害。',
			wuzhong_info:'出牌阶段，对你使用。你摸两张牌。',
			juedou_info:'出牌阶段，对一名其他角色使用。由其开始，其与你轮流打出一张【杀】，直到其中一方未打出【杀】为止。未打出【杀】的一方受到另一方对其造成的1点伤害。',
			shunshou_info:'出牌阶段，对距离为1且区域里有牌的一名其他角色使用。你获得其区域里的一张牌。',
			guohe_info:'出牌阶段，对区域里有牌的一名其他角色使用。你弃置其区域里的一张牌。',
			jiedao_info:'出牌阶段，对装备区里有武器牌且有使用【杀】的目标的一名其他角色使用。令其对你指定的一名角色使用一张【杀】，否则将其装备区里的武器牌交给你。',
			wuxie_info:'一张锦囊牌生效前，对此牌使用。抵消此牌对一名角色产生的效果，或抵消另一张【无懈可击】产生的效果。',
			lebu_info:'出牌阶段，对一名其他角色使用。若判定结果不为红桃，跳过其出牌阶段。',
			shandian_info:'出牌阶段，对自己使用。若判定结果为黑桃2~9，则目标角色受到3点雷电伤害。若判定不为黑桃2~9，将之移动到下家的判定区里。',
		},
		list:[
			["spade",7,"sha"],
			["spade",8,"sha"],
			["spade",8,"sha"],
			["spade",9,"sha"],
			["spade",9,"sha"],
			["spade",10,"sha"],
			["spade",10,"sha"],
			["club",2,"sha"],
			["club",3,"sha"],
			["club",4,"sha"],
			["club",5,"sha"],
			["club",6,"sha"],
			["club",7,"sha"],
			["club",8,"sha"],
			["club",8,"sha"],
			["club",9,"sha"],
			["club",9,"sha"],
			["club",10,"sha"],
			["club",10,"sha"],
			["club",11,"sha"],
			["club",11,"sha"],
			["heart",10,"sha"],
			["heart",10,"sha"],
			["heart",11,"sha"],
			["diamond",6,"sha"],
			["diamond",7,"sha"],
			["diamond",8,"sha"],
			["diamond",9,"sha"],
			["diamond",10,"sha"],
			["diamond",13,"sha"],
			["heart",2,"shan"],
			["heart",2,"shan"],
			["heart",13,"shan"],
			["diamond",2,"shan"],
			["diamond",2,"shan"],
			["diamond",3,"shan"],
			["diamond",4,"shan"],
			["diamond",5,"shan"],
			["diamond",6,"shan"],
			["diamond",7,"shan"],
			["diamond",8,"shan"],
			["diamond",9,"shan"],
			["diamond",10,"shan"],
			["diamond",11,"shan"],
			["diamond",11,"shan"],
			["heart",3,"tao"],
			["heart",4,"tao"],
			["heart",6,"tao"],
			["heart",7,"tao"],
			["heart",8,"tao"],
			["heart",9,"tao"],
			["heart",12,"tao"],
			["diamond",12,"tao"],

			["spade",2,"bagua"],
			["club",2,"bagua"],
			["spade",5,"jueying"],
			["club",5,"dilu"],
			["heart",13,"zhuahuang"],
			["heart",5,"chitu"],
			["spade",13,"dawan"],
			["diamond",13,"zixin"],
			["club",1,"zhuge"],
			["diamond",1,"zhuge"],
			["spade",2,"cixiong"],
			["spade",6,"qinggang"],
			["spade",5,"qinglong"],
			["spade",12,"zhangba"],
			["diamond",5,"guanshi"],
			["diamond",12,"fangtian"],
			["heart",5,"qilin"],

			["heart",3,"wugu"],
			["heart",4,"wugu"],
			["heart",1,"taoyuan"],
			["spade",7,"nanman"],
			["spade",13,"nanman"],
			["club",7,"nanman"],
			["heart",1,"wanjian"],
			["spade",1,"juedou"],
			["club",1,"juedou"],
			["diamond",1,"juedou"],
			["heart",7,"wuzhong"],
			["heart",8,"wuzhong"],
			["heart",9,"wuzhong"],
			["heart",11,"wuzhong"],
			["spade",3,'shunshou'],
			["spade",4,'shunshou'],
			["spade",11,'shunshou'],
			["diamond",3,'shunshou'],
			["diamond",4,'shunshou'],
			["spade",3,'guohe'],
			["spade",4,'guohe'],
			["spade",12,'guohe'],
			["club",3,'guohe'],
			["club",4,'guohe'],
			["heart",12,'guohe'],
			["club",12,'jiedao'],
			["club",13,'jiedao'],
			["spade",11,'wuxie'],
			["club",12,'wuxie'],
			["club",13,'wuxie'],
			["spade",6,'lebu'],
			["club",6,'lebu'],
			["heart",6,'lebu'],
			["spade",1,'shandian','thunder'],
			["spade",2,'hanbing'],
			["club",2,'renwang'],
			["heart",12,'shandian','thunder'],
			["diamond",12,'wuxie'],
		],
	};
});
