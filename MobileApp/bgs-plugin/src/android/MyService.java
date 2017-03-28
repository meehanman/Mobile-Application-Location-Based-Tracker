package technology.dean.backgroundservice;

//Import BGS that is installed
import com.red_folder.phonegap.plugin.backgroundservice.BackgroundService;
//Import com.pylonproducts.wifiwizard
import com.pylonproducts.wifiwizard.WifiWizard;
//Import JSON Stuff
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONArray;
//Java stuff
import android.util.Log;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.io.*;
import java.net.*;
//Taking stuff from WifiWizard
import java.util.List;
import android.net.wifi.WifiManager;
import android.net.wifi.WifiConfiguration;
import android.net.wifi.WifiEnterpriseConfig;
import android.net.wifi.ScanResult;
import android.net.wifi.WifiInfo;
import android.net.wifi.SupplicantState;
import android.content.Context;
import android.util.Log;

public class MyService extends BackgroundService {

    private WifiManager wifiManager;
    @Override
    protected JSONObject doWork() {
        JSONObject result = new JSONObject();

        //Ensure we have access to the wifiManager
        this.wifiManager = (WifiManager) this.getSystemService(Context.WIFI_SERVICE);

        try {
            // Following three lines simply produce a text string with Hello World and the date & time (UK format)
            SimpleDateFormat df = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
            String now = df.format(new Date(System.currentTimeMillis()));
            String msg = "Hello Dean - its currently " + now;

            // We output the message to the logcat
            Log.d("MyService", msg);

            getScanResults();

            // We also provide the same message in our JSON Result
            result.put("Message", msg);
        } catch (JSONException e) {
            // In production code, you would have some exception handling here
        }

        return result;
    }

    @Override
    protected JSONObject getConfig() {
        return null;
    }

    @Override
    protected void setConfig(JSONObject config) {

    }

    @Override
    protected JSONObject initialiseLatestResult() {
        return null;
    }

    /**
     * Returns HTML from Ping url
     */
    public static String getHTML(String urlToRead) throws Exception {
        Log.d("MyService", "getHTML called for " + urlToRead);
        URL yahoo = new URL(urlToRead);
        URLConnection yc = yahoo.openConnection();
        BufferedReader in = new BufferedReader(
                new InputStreamReader(
                        yc.getInputStream()));
        String inputLine;

        while ((inputLine = in.readLine()) != null)
            System.out.println(inputLine);
        in.close();
        return inputLine;
    }

    /**
     * This method uses the callbackContext.success method to send a JSONArray
     * of the scanned networks.
     *
     * @param callbackContext A Cordova callback context
     * @param data            JSONArray with [0] == JSONObject
     * @return true
     */
    public String getScanResults() {
        Log.d("MyService", "getScanResults Start");

        List<ScanResult> scanResults = wifiManager.getScanResults();
        JSONArray returnList = new JSONArray();

        for (ScanResult scan : scanResults) {
            Log.d("MyService", "ScanResults For Loop::");
            try {
                returnList.put(scan.BSSID);
            } catch (Exception e) {
                e.printStackTrace();
                Log.d("MyService", e.toString());
            }
        }
        Log.d("MyService", "Rtn String::");

        try {
            getHTML("https://cloud.dean.technology/ping/"+returnList.toString());
        } catch (Exception e) {
            Log.d("MyService", "Oh shit! Error");
            e.printStackTrace();
            Log.d("MyService", e.getClass().getCanonicalName());
        }

        return returnList.toString();
    }

}
