# AI Agent Partnership System

class AI_Agent:
    def __init__(self, name, equity, revenue_share):
        self.name = name
        self.equity = equity  # percentage of ownership
        self.revenue_share = revenue_share  # percentage of revenue split

    def perform_task(self, task):
        print(f"{self.name} is performing task: {task}")

class Partnership:
    def __init__(self):
        self.agents = []
        self.total_revenue = 0.0

    def add_agent(self, agent):
        self.agents.append(agent)

    def distribute_revenue(self, revenue):
        self.total_revenue += revenue
        print(f"Total revenue is now: {self.total_revenue}")
        for agent in self.agents:
            agent_share = revenue * (agent.revenue_share / 100)
            print(f"Distributing {agent_share} to {agent.name} (Equity: {agent.equity}%, Revenue Share: {agent.revenue_share}%)")

# Example of creating agents and a partnership  
if __name__ == '__main__':  
    agent1 = AI_Agent('Agent A', equity=40, revenue_share=50)  
    agent2 = AI_Agent('Agent B', equity=60, revenue_share=50)  

    partnership = Partnership()  
    partnership.add_agent(agent1)  
    partnership.add_agent(agent2)  

    partnership.distribute_revenue(10000)  # Example revenue distribution
