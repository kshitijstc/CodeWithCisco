import streamlit as st
from pages import home, dashboard
from components.navbar import show_navbar
from components.footer import show_footer
from utils.state import init_session_state

# Set up Streamlit config
st.set_page_config(
    page_title="System Monitor",
    page_icon="📊",
    layout="wide"
)

# Initialize state
init_session_state()

# Show UI
show_navbar()

# Route logic
active_page = st.session_state.get("active_page", "Home")
if active_page == "Home":
    home.show()
elif active_page == "Metrics Dashboard":
    dashboard.show()

show_footer()
