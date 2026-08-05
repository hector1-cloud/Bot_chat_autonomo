class ResponseGenerator:
    def __init__(self, llm):
        self.llm = llm
    async def generate(self, system_prompt, user_prompt):
        result = await self.llm.generate(system_prompt, user_prompt)
        return result.text
