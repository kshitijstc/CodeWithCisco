import streamlit as st
from pages import home, dashboard
from utils.state import init_session_state

# Set page config
st.set_page_config(
    page_title="System Monitor",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize session state
init_session_state()

# Sidebar navigation
st.sidebar.title("System Monitor")
page = st.sidebar.radio("Navigate to:", ["Home", "Metrics Dashboard"])

# Route to the selected page
if page == "Home":
    home.show()
elif page == "Metrics Dashboard":
    dashboard.show()
