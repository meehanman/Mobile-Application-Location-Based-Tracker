package technology.dean.backgroundservice;

//Import BGS that is installed
import com.red_folder.phonegap.plugin.backgroundservice.BackgroundService;
//Import JSON Stuff
import org.json.JSONException;
import org.json.JSONObject;
//Java stuff
import android.util.Log;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.io.*;
import java.net.*;

public class MyService extends BackgroundService {
  @Override
protected JSONObject doWork() {
  JSONObject result = new JSONObject();

  try {
     // Following three lines simply produce a text string with Hello World and the date & time (UK format)
     SimpleDateFormat df = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
     String now = df.format(new Date(System.currentTimeMillis()));
     String msg = "Hello World - its currently " + now;

     try{
       getHTML("https://cloud.dean.technology/ping/PrintingFromService");
    }catch(Exception e){
      Log.d("MyService", "Oh shit! Error");
      e.printStackTrace();
      Log.d("MyService", e.getClass().getCanonicalName());
    }
     // We output the message to the logcat
     Log.d("MyService", msg);

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
  Log.d("MyService","getHTML called for "+urlToRead);
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
}
