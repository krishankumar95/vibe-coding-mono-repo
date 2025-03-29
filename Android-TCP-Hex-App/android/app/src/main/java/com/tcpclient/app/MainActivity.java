package com.tcpclient.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.tcp.client.DirectTcpClientPlugin;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(DirectTcpClientPlugin.class);
    super.onCreate(savedInstanceState);
  }
}
