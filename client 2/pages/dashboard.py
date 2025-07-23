import streamlit as st
import pandas as pd
import time
import os
import json

from utils.metrics import (
    get_system_metrics,
    load_latest_log,
    trigger_attack_simulation,  # 🔁 this must exist in utils.metrics.py
    get_attack_status,          # 🔁 new helper function to check persistent attack
    clear_attack_status         # 🔁 new helper function to clear the alert
)

from utils.charts import create_gauge_chart, create_line_chart

def show():
    st.title("System Metrics Dashboard")
    col1, col2 = st.columns(2)
    with col1:
        if st.button("💥 Trigger DDoS Attack"):
            trigger_attack_simulation()
    with col2:
        if st.button("✅ Clear Alert"):
            clear_attack_status()


# Load latest log and show alert
log = load_latest_log()
log = load_latest_log()
attack_active, attack_time = get_attack_status()
if attack_active:
    st.error("🚨 DDoS Attack Detected!")
    if attack_time:
        st.markdown(f"Detected at: `{attack_time}`")


    refresh_rate = st.session_state.refresh_rate
    placeholder = st.empty()

    with placeholder.container():
        current_metrics = get_system_metrics()

        if current_metrics:
            st.session_state.metrics_data.append(current_metrics)
            if len(st.session_state.metrics_data) > 100:
                st.session_state.metrics_data.pop(0)

            col1, col2 = st.columns(2)
            col1.markdown(f"**Last Updated:** {current_metrics['timestamp'].strftime('%Y-%m-%d %H:%M:%S')}")
            col2.markdown(f"**Refresh Rate:** {refresh_rate} seconds")

            st.markdown("---")
            st.subheader("Current System Status")
            a, b, c = st.columns(3)
            a.plotly_chart(create_gauge_chart(current_metrics['cpu_usage'], "CPU Usage (%)"), use_container_width=True)
            b.plotly_chart(create_gauge_chart(current_metrics['memory_usage'], "Memory Usage (%)"), use_container_width=True)
            c.plotly_chart(create_gauge_chart(current_metrics['disk_usage'], "Disk Usage (%)"), use_container_width=True)

            st.subheader("Historical Data")
            if len(st.session_state.metrics_data) > 1:
                data = st.session_state.metrics_data
                d1, d2 = st.columns(2)
                d1.plotly_chart(create_line_chart(data, 'cpu_usage', 'CPU Usage Over Time', 'red'), use_container_width=True)
                d1.plotly_chart(create_line_chart(data, 'disk_usage', 'Disk Usage Over Time', 'orange'), use_container_width=True)
                d2.plotly_chart(create_line_chart(data, 'memory_usage', 'Memory Usage Over Time', 'blue'), use_container_width=True)
                d2.plotly_chart(create_line_chart(data, 'network_sent', 'Network Sent (MB)', 'green'), use_container_width=True)

            st.subheader("Detailed Metrics")
            df = pd.DataFrame([{
                'Metric': 'CPU Usage',
                'Value': f"{current_metrics['cpu_usage']:.1f}%",
                'Status': '🟢 Normal' if current_metrics['cpu_usage'] < 80 else '🔴 High'
            }, {
                'Metric': 'Memory Usage',
                'Value': f"{current_metrics['memory_usage']:.1f}% ({current_metrics['memory_available']:.1f}GB free)",
                'Status': '🟢 Normal' if current_metrics['memory_usage'] < 80 else '🔴 High'
            }, {
                'Metric': 'Disk Usage',
                'Value': f"{current_metrics['disk_usage']:.1f}% ({current_metrics['disk_free']:.1f}GB free)",
                'Status': '🟢 Normal' if current_metrics['disk_usage'] < 80 else '🔴 High'
            }])
            st.dataframe(df, use_container_width=True, hide_index=True)

    time.sleep(refresh_rate)
    st.rerun()
