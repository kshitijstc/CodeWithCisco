import streamlit as st

def show_footer():
    st.markdown("""
        <style>
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 10px 30px;
            background-color: #f0f2f6;
            text-align: center;
            font-size: 14px;
            color: #888;
            border-top: 1px solid #ccc;
        }
        </style>
        <div class="footer">
            ⚙️ Developed as part of the Aegis of Alderaan
    """, unsafe_allow_html=True)
