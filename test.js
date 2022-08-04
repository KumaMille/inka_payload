const crypto =  require('crypto');
const moment = require('moment');

const INKA_ACCESS_KEY = "0wX7XJZtO216KgBW3j4SuBA6GjJlcBtH" // inkaDRM Access Key
const INKA_SITE_KEY = "3cA0XxFSp46cG0deupx0ryDrujm7geNG" //inkaDRM Site Key
const INKA_SITE_ID = "JQ4I" // inkaDRM Site ID
const INKA_IV = "0123456789abcdef" //inkaDRM AES 256 Encryption Initialization



const KOLLUS_SECURITY_KEY= "milliemulti" //Kollus Account Key
const KOLLUS_CUSTOM_KEY=  "a450ab355c98bed9bbec24645ee2476202339130ac67e24bc47d8b43280b6ecc" //Kollus Custom User Key
const CLIENT_USER_ID=  "milliemulti"  // Client User ID
const cid = "20220803-iar05f2c" // Multi DRM Contents ID, Kollus Upload File Key
const mckey = "yjPxj2JQ"  // Kollus MediaContentKey



const drmType = IS_ANDROID ? "Widevine" : "FairPlay"
const streamingType = IS_ANDROID? "dash" : "hls"
const ALGORITHM = 'aes-256-cbc'
const BASE64 = 'base64'



const wideVineToken = JSON.stringify({
    "policy_version": 2,
    "playback_policy":
    {
        "limit": true,
        "persistent": false,
        "duration": 86400
    },
    "security_policy": [
    {
        "widevine":
        {
            "security_level": 1,
            "required_hdcp_version": "HDCP_NONE",
            "required_cgms_flags": "CGMS_NONE",
            "disable_analog_output": false,
            "hdcp_srm_rule": "HDCP_SRM_RULE_NONE",
            "override_device_revocation": true
        }
    }]
})

const fairPlayToken = JSON.stringify({
	"playback_policy":
	{
		"limit": true,
		"persistent": false,
		"duration": 86400
	},
	"security_policy":
	{
		"playready":
		{
			"security_level": 150,
			"digital_video_protection_level": 100,
			"analog_video_protection_level": 100,
			"digital_audio_protection_level": 100,
			"require_hdcp_type_1": false
		},
		"fairplay":
		{
			"hdcp_enforcement": -1,
			"allow_airplay": true,
			"allow_av_adapter": true
		},
		"ncg":
		{
			"allow_mobile_abnormal_device": false,
			"allow_external_display": false,
			"control_hdcp": 0
		}
	}
})

const token = IS_ANDROID ? wideVineToken : fairPlayToken

// 라이센스 룰 암호화 
const encryption = (token)=>{
    const cipher = crypto.createCipheriv(ALGORITHM, INKA_SITE_KEY, INKA_IV);
    let result = cipher.update(token, 'utf8', BASE64); 
    result += cipher.final(BASE64); 
    console.log(`encryption 암호화 값 :${result}`)
    return result
}

const decryption = (encryptionValue)=>{
    const decipher = crypto.createDecipheriv(ALGORITHM, INKA_SITE_KEY, INKA_IV);
    let result = decipher.update(encryptionValue, BASE64, 'utf8'); // 암호화할문 (base64, utf8이 위의 cipher과 반대)
    result += decipher.final('utf8');
    return result
}

// 해시값 생성 (sha256)
const makeHash = (timestamp)=>{
    console.log(`makeHash timestamp 값 : ${timestamp}`)
    let hash = `${INKA_ACCESS_KEY}.${drmType}.${INKA_SITE_ID}.${CLIENT_USER_ID}.${cid}.${token}.${timestamp}`
    hash = crypto.createHash('sha256')
                   .update(hash)
                   .digest(BASE64);
    console.log(`makeHash hash 값 ${hash}`)
    return hash
}

const makeTimeStamp= ()=>`${moment().format('YYYY-MM-DD')}T${moment().format('hh:mm:ss')}Z`

//라이센스 토큰 생성
const makeInkaPayload = (drmType, siteId, userId, cid, token, timestamp, hash)=>{
    let payload = {
        "drm_type": drmType,
        "site_id": siteId,
        "user_id": userId,
        "cid": cid,
        "token": token,
        "timestamp": timestamp,
        "hash": hash
    }
    payload =JSON.stringify(payload)
    console.log(`makeInkaPayload json 값 ${payload}`)
    payload = Buffer.from(payload, "utf8").toString(BASE64)
    console.log(`makeInkaPayload base64 값 ${payload}`)
    return payload
}

const makeAll=()=>{
    const encryptionValue = encryption(token) 
    const timestamp = makeTimeStamp();
    const hash = makeHash(timestamp) 
    const payload = makeInkaPayload(drmType, INKA_SITE_ID,CLIENT_USER_ID, cid,encryptionValue, timestamp, hash)
    console.log(`makeAll 최종 payload 값 ${payload}`)
    return payload
}

makeAll()


