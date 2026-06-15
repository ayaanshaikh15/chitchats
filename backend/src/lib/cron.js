import {CronJob} from 'cron'
import http from 'node:http'
import https from "node:https"

const job = new CronJob('*/14 * * * *', async () => {
    
   const base = procress.env.FRONTEND_URL

   if(!base) return
   const url = new URL("/",base).href;
   const client = url.startsWith("https") ? https : http;
   client.get(url, (res) => {
      if(res.statusCode === 200)
      console.log(`Cron job executed. Status code: ${res.statusCode}`);
      else
        console.log(`Cron job failed to execute. Status code: ${res.statusCode}`);
    
   }).on('error', (err) => {
      console.error(`Error executing cron job: ${err.message}`);
   });
});

export default job;