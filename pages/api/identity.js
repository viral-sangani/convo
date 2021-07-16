import { checkPoH, checkUnstoppableDomains } from "@/lib/identity";
import { getClient } from "@/lib/thread-db";
import { Where , ThreadID} from '@textile/hub';
import { ethers } from "ethers";
import { getAddress, isAddress } from 'ethers/lib/utils';
import fetcher from '@/utils/fetcher';

async function calculateScore(address) {
    let tp = new ethers.providers.AlchemyProvider("mainnet","qqQIm10pMOOsdmlV3p7NYIPt91bB0TL4");

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    const query = new Where('_id').eq(getAddress(address));

    let promiseArray = [
        checkPoH(address),
        fetcher(`https://app.brightid.org/node/v5/verifications/Convo/${address.toLowerCase()}`, "GET", {}),
        fetcher(`https://api.poap.xyz/actions/scan/${address}`, "GET", {}),
        tp.lookupAddress(address),
        fetcher(`https://api.idena.io/api/Address/${address}`, "GET", {}),
        fetcher(`https://api.cryptoscamdb.org/v1/check/${address}`, "GET", {}),
        checkUnstoppableDomains(address),
        threadClient.find(threadId, 'cachedSybil', query),
        fetcher(`https://backend.deepdao.io/user/${address.toLowerCase()}`, "GET", {}),
    ];

    let results = await Promise.allSettled(promiseArray);

    let score = 0;
    let retData = {
        'success': true,
        'poh': results[0].value,
        'brightId': Boolean(results[1].value.data?.unique),
        'poap': results[2].value?.length,
        'ens': Boolean(results[3].value),
        'idena': Boolean(results[4].value?.result),
        'cryptoScamDb': Boolean(results[5].value?.success),
        'unstoppableDomains': Boolean(results[6].value),
        'uniswapSybil': results[7].value.length,
        'deepdao': parseInt(results[8].value?.totalDaos)
    };

    if(results[0].value === true){ // poh
        score += 8;
    }
    if(Boolean(results[1].value.data?.unique) === true){ // brightid
        score += 37;
    }
    if(Boolean(results[2].value) === true){ // poap
        score += results[2].value.length;
    }
    if(Boolean(results[3].value) === true){ // ens
        score += 12;
    }
    if(Boolean(results[4].value?.result) === true){ // idena
        score += 1;
    }
    if(Boolean(results[5].value?.success) === true){ // cryptoscamdb
        score -= 20;
    }
    if(Boolean(results[6].value) === true){ // unstoppable domains
        score += 1;
    }
    if(results[7].value.length > 0){ // uniswap sybil
        score += 10;
    }
    if(parseInt(results[8].value?.totalDaos)> 0){ // deepdao
        score += parseInt(results[8].value?.totalDaos);
    }

    retData['score'] = score;

    return retData;
}

async function setCache(address, scoreData) {

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    await threadClient.save(threadId, 'cachedTrustScores', [{
        '_id': getAddress(address),
        ...scoreData
    }]);
}

export default async (req, res) => {

    if (Object.keys(req.query).includes('apikey') === false || req.query.apikey !== 'CONVO' ){
        res.status(401).json({
          'success': false,
          'error': 'Invalid API key, please refer to the integration docs at https://docs.theconvo.space/ to see how to get and use a new API key.'
        });
    }

    try {

        if (Object.keys(req.query).includes('address') === true && isAddress(req.query.address) === true ){

            if (req.query?.noCache == 'true') {
                let scoreData = await calculateScore(req.query.address);
                res.status(200).json(scoreData);
            }
            else {
                let threadClient = await getClient();
                const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
                const query = new Where('_id').eq(getAddress(req.query.address));
                let cachedTrustScore = await threadClient.find(threadId, 'cachedTrustScores', query);

                // cache-hit
                if (cachedTrustScore.length > 0) {
                    res.setHeader('Cache-Control', 'public, max-age=7200');
                    res.status(200).json({
                        ...cachedTrustScore[0]
                    });
                }
                // cache-miss
                else {
                    let scoreData = await calculateScore(req.query.address);
                    setCache(req.query.address, scoreData);
                    res.setHeader('Cache-Control', 'public, max-age=7200');
                    res.status(200).json(scoreData);
                }

            }
        }
        else {
            res.status(401).json({
                'success': false,
                'error': 'Invalid Address.'
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ 'success': false, error });
    }
}
