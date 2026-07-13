export const CENTRAL_LOBBY_PATCH = `
<script>
(function(){
  if(window.__bfCentralLobby)return;
  window.__bfCentralLobby=true;
  var pending={},seq=0,ownerToken='bf-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),retryCount=0;

  function request(action,data){
    return new Promise(function(resolve,reject){
      var requestId='lobby-'+(++seq);pending[requestId]={resolve:resolve,reject:reject};
      var payload=Object.assign({action:action,token:ownerToken},data||{});
      window.parent.postMessage({bfLobby:{requestId:requestId,payload:payload}},'*');
      setTimeout(function(){if(!pending[requestId])return;delete pending[requestId];reject(new Error('timeout'));},8000);
    });
  }
  window.addEventListener('message',function(event){
    var result=event.data&&event.data.bfLobbyResult;if(!result||!pending[result.requestId])return;
    var task=pending[result.requestId];delete pending[result.requestId];
    if(result.error)task.reject(new Error(result.error));else task.resolve(result.data||{});
  });

  function centralList(){
    if(typeof LOBBY==='undefined')return;
    LOBBY.role='central';
    request('list').then(function(data){LOBBY.rooms=data.rooms||[];if(typeof renderRoomList==='function'&&typeof isLobby==='function'&&isLobby()&&typeof NET!=='undefined'&&!NET.role)renderRoomList();}).catch(function(){if(typeof renderRoomList==='function'&&typeof isLobby==='function'&&isLobby()&&typeof NET!=='undefined'&&!NET.role)renderRoomList();});
  }

  function install(){
    if(typeof LOBBY==='undefined'||typeof window.hostCreate!=='function'||typeof window.renderRoomList!=='function')return false;
    window.lobbyConnect=function(){LOBBY.role='central';centralList();};
    window.refreshList=centralList;
    window.dirRegister=function(code,name,hasPass){
      LOBBY._reg={code:code,name:name,hasPass:hasPass,confirmed:false};
      var attempts=0;
      return new Promise(function(resolve,reject){
        function register(){
          attempts+=1;
          request('register',{code:code,name:name,hasPass:!!hasPass}).then(function(data){
            if(!data||data.ok!==true)throw new Error('register rejected');
            return request('list');
          }).then(function(data){
            var visible=(data.rooms||[]).some(function(room){return room.id===code;});
            if(!visible)throw new Error('room not visible');
            if(LOBBY._reg&&LOBBY._reg.code===code)LOBBY._reg.confirmed=true;
            resolve({ok:true});
          }).catch(function(error){
            if(attempts<3){setTimeout(register,800*attempts);return;}
            if(LOBBY._reg&&LOBBY._reg.code===code)LOBBY._reg=null;
            reject(error);
          });
        }
        register();
      });
    };
    window.dirUnregister=function(){
      var r=LOBBY._reg;if(!r)return;request('unregister',{code:r.code}).catch(function(){});LOBBY._reg=null;
    };

    centralList();
    return true;
  }

  var tries=0,timer=setInterval(function(){if(install()||tries++>50)clearInterval(timer);},100);
  setInterval(function(){
    if(typeof NET!=='undefined'&&NET.role==='host'&&NET.code&&NET.peer&&NET.peer.open&&!NET.conn?.open)request('touch',{code:NET.code}).catch(function(){});
    if(typeof isLobby==='function'&&isLobby()&&typeof NET!=='undefined'&&!NET.role)centralList();
  },30000);
})();
</script>
`;