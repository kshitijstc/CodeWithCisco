import streamlit as st
from utils.metrics import get_system_metrics

def show():
    st.title("🖥️ System Monitor")
    st.markdown("---")

    col1, col2, col3 = st.columns([1, 2, 1])

    with col2:
        st.markdown("""
        Monitor your system's performance in real-time.
        Configure your settings in the sidebar and view live metrics.
        """)

        refresh_rate = st.session_state.refresh_rate
        st.info(f"Current refresh rate: {refresh_rate} seconds")

        st.markdown("### Quick System Overview")
        current_metrics = get_system_metrics()
        if current_metrics:
            a, b, c = st.columns(3)
            a.metric("CPU Usage", f"{current_metrics['cpu_usage']:.1f}%")
            b.metric("Memory Usage", f"{current_metrics['memory_usage']:.1f}%")
            c.metric("Disk Usage", f"{current_metrics['disk_usage']:.1f}%")
