import streamlit as st

def show_navbar():
    st.markdown("""
        <style>
        .navbar {
            background-color: #f0f2f6;
            padding: 10px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #ccc;
        }
        .navbar-title {
            font-size: 24px;
            font-weight: bold;
            color: #31333f;
        }
        </style>
    """, unsafe_allow_html=True)

    # Navbar layout
    st.markdown('<div class="navbar">', unsafe_allow_html=True)
    col1, col2 = st.columns([3, 1.5])
    with col1:
        st.markdown('<div class="navbar-title">📡 Aegis of Alderaan</div>', unsafe_allow_html=True)
    with col2:
        col_btn1, col_btn2 = st.columns([1, 1])
        with col_btn1:
            if st.button("Home"):
                st.session_state.active_page = "Home"
        with col_btn2:
            if st.button("Metrics Dashboard"):
                st.session_state.active_page = "Metrics Dashboard"
    st.markdown('</div>', unsafe_allow_html=True)
    st.markdown("---")
