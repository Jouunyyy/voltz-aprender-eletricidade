"""Live integration smoke test. Supply VOLTZ_TEST_EMAIL and VOLTZ_TEST_PASSWORD; never commits credentials."""
import os, json, urllib.request, urllib.error
BASE='https://utgtvdmafmehjgebyhqk.supabase.co'
KEY='sb_publishable_RJmuDpACfRDdDjS66HRCSQ_hTtxAfht'
def call(path,body,token=None):
    req=urllib.request.Request(BASE+path,data=json.dumps(body).encode(),headers={'apikey':KEY,'Content-Type':'application/json',**({'Authorization':'Bearer '+token} if token else {})})
    with urllib.request.urlopen(req,timeout=25) as r:return json.load(r)
s=call('/auth/v1/token?grant_type=password',{'email':os.environ['VOLTZ_TEST_EMAIL'],'password':os.environ['VOLTZ_TEST_PASSWORD']})
token=s['access_token']; print('Auth login PASS',flush=True)
def live(action,**data):return call('/functions/v1/voltz-live',{'action':action,'input':data},token)
state=live('create',config={'categoryId':'aprendiz','levelId':None,'count':5,'duration':0,'showLeaderboard':True,'showExplanations':True})
sid=state['id']
try:
    assert len(state['participants'])==1 and state['total']==5 and state['question'] is None
    print('Create + automatic host participant + code PASS',flush=True)
    state=live('start',id=sid)
    for i in range(5):
        assert 'answer' not in state['question'] and 'explanation' not in state['question']
        state=live('answer',id=sid,position=i,answer=0)
        assert state['phase']=='reveal' and state['question']['explanation']
        for phase in ['reveal','leaderboard']:state=live('next',id=sid,position=i,phase=phase)
    assert state['phase']=='finished' and len(state['summary'])==5
    print('Five real Edge API rounds, answer secrecy, reveal, ranking, final PASS',flush=True)
    restored=live('state',id=sid)
    assert restored['participants']==state['participants']
    print('Restore finished state PASS',flush=True)
finally:
    live('end',id=sid)
