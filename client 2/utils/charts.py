import plotly.graph_objects as go
import plotly.express as px
import pandas as pd

def create_gauge_chart(value, title, max_value=100):
    fig = go.Figure(go.Indicator(
        mode="gauge+number+delta",
        value=value,
        title={'text': title},
        delta={'reference': max_value * 0.5},
        gauge={
            'axis': {'range': [0, max_value]},
            'bar': {'color': "darkblue"},
            'steps': [
                {'range': [0, max_value * 0.5], 'color': "lightgray"},
                {'range': [max_value * 0.5, max_value * 0.8], 'color': "yellow"},
                {'range': [max_value * 0.8, max_value], 'color': "red"}
            ],
            'threshold': {
                'line': {'color': "red", 'width': 4},
                'value': max_value * 0.9
            }
        }
    ))
    fig.update_layout(height=300)
    return fig

def create_line_chart(data, y_column, title, color):
    if not data:
        return go.Figure()
    df = pd.DataFrame(data)
    fig = px.line(df, x='timestamp', y=y_column, title=title, color_discrete_sequence=[color])
    fig.update_layout(height=300)
    return fig
