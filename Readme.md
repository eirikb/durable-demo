### Run

```Bash
npm i
# I use real storage, but this should work using emulator
export AzureWebJobsStorage=UseDevelopmentStorage=true
npm start
sleep 10s
curl -vvv http://localhost:7071/api/Start?webUrl=a&listUrl=b
```
