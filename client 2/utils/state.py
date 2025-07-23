import streamlit as st
import queue

def init_session_state():
    if 'metrics_data' not in st.session_state:
        st.session_state.metrics_data = []
    if 'refresh_rate' not in st.session_state:
        st.session_state.refresh_rate = 5
    if 'data_queue' not in st.session_state:
        st.session_state.data_queue = queue.Queue()
    if 'active_page' not in st.session_state:
        st.session_state.active_page = "Home"
