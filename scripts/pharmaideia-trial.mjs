import {seedTrial,revokeTrial,destroyTrial,trialConfiguration}from'../backend/testing/trial.mjs';
import {startBackend}from'../backend/src/http.mjs';
const [action,directory]=process.argv.slice(2);
if(!directory||!['seed','run','revoke','destroy'].includes(action))throw new Error('Usage: node scripts/pharmaideia-trial.mjs seed|run|revoke|destroy /private/new-trial-directory');
if(action==='run'){
    const config=await trialConfiguration(directory);if(config.expiresAt<=Date.now())throw new Error('Trial expired. Create a new isolated trial.');
    const app=await startBackend(config,{port:Number(process.env.PHARMAIDEIA_PORT??4175)});
    console.log('Synthetic trial running on loopback only. No public activation or external provider is enabled.');
    for(const event of ['SIGINT','SIGTERM'])process.once(event,async()=>{await app.close();process.exit(0);});
}else console.log(JSON.stringify(await(action==='seed'?seedTrial(directory):action==='revoke'?revokeTrial(directory):destroyTrial(directory))));
