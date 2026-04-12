function detectLocale(): 'zh' | 'en' {
    const locale = (window as any).moment?.locale() ?? navigator.language;
    return locale.startsWith('zh') ? 'zh' : 'en';
}

const strings: Record<string, {zh: string, en: string}> = {
    "tab.search": {zh: "搜索", en: "Search"},
    "tab.ask": {zh: "问答", en: "Ask"},
    "tab.related": {zh: "关联", en: "Related"},

    "search.placeholder": {zh: "语义搜索...", en: "Semantic search..."},
    "search.loading": {zh: "搜索中...", en: "Searching..."},
    "search.noResults": {zh: "无结果", en: "No results"},
    "search.errorPrefix": {zh: "错误: ", en: "Error: "},
    "search.indexNotLoaded": {zh: "索引未加载", en: "Index not loaded"},

    "ask.placeholder": {zh: "向知识库提问...", en: "Ask your vault..."},
    "ask.submit": {zh: "提问", en: "Ask"},
    "ask.thinking": {zh: "思考中...", en: "Thinking..."},
    "ask.sourcesLabel": {zh: "参考来源：", en: "Sources:"},
    "ask.errorPrefix": {zh: "错误: ", en: "Error: "},
    "ask.indexNotLoaded": {zh: "索引未加载", en: "Index not loaded"},

    "related.insertLink": {zh: "插入链接", en: "Insert link"},
    "related.noActiveNote": {zh: "请打开一篇笔记", en: "Open a note first"},
    "related.indexNotLoaded": {zh: "索引未加载", en: "Index not loaded"},
    "related.notInIndex": {zh: "当前笔记不在索引中，请重建索引", en: "Note not indexed. Please rebuild index."},
    "related.loading": {zh: "加载中...", en: "Loading..."},
    "related.titlePrefix": {zh: "与「", en: "Related to \""},
    "related.titleSuffix": {zh: "」相关：", en: "\":"},
    "related.errorPrefix": {zh: "错误: ", en: "Error: "},

    "stale.bannerPrefix": {zh: "⚠️ 索引与当前配置不兼容，搜索结果不可信，请重建索引。\n原因：", en: "⚠️ Index is incompatible with current config. Please rebuild.\nReason: "},
    "stale.versionMismatch": {zh: "索引格式已过期，请重建索引", en: "Index format outdated, please rebuild"},

    "indexer.buildComplete": {zh: "✓ 索引构建完成，共 %d 篇笔记", en: "✓ Index built: %d notes"},
    "indexer.upToDate": {zh: "索引已是最新，无需更新", en: "Index is up to date"},
    "indexer.incrementalComplete": {zh: "✓ 增量更新完成，更新 %d 篇笔记", en: "✓ Incremental update: %d notes updated"},
    "indexer.building": {zh: "构建中...", en: "Building..."},
    "indexer.noChanges": {zh: "无需更新", en: "No changes"},

    "settings.embeddingSection": {zh: "Embedding", en: "Embedding"},
    "settings.embeddingBaseUrl": {zh: "Base URL", en: "Base URL"},
    "settings.embeddingModel": {zh: "模型", en: "Model"},
    "settings.embeddingApiKey": {zh: "API Key", en: "API Key"},
    "settings.rerankerSection": {zh: "Reranker", en: "Reranker"},
    "settings.rerankerEnabled": {zh: "启用 Reranker", en: "Enable Reranker"},
    "settings.rerankerBaseUrl": {zh: "Reranker Base URL", en: "Reranker Base URL"},
    "settings.rerankerModel": {zh: "Reranker 模型", en: "Reranker Model"},
    "settings.rerankerApiKey": {zh: "Reranker API Key", en: "Reranker API Key"},
    "settings.llmSection": {zh: "LLM", en: "LLM"},
    "settings.llmProvider": {zh: "Provider", en: "Provider"},
    "settings.llmBaseUrl": {zh: "LLM Base URL", en: "LLM Base URL"},
    "settings.llmModel": {zh: "LLM 模型", en: "LLM Model"},
    "settings.llmApiKey": {zh: "LLM API Key", en: "LLM API Key"},
    "settings.indexSection": {zh: "索引管理", en: "Index Management"},
    "settings.indexLocation": {zh: "索引位置：vault根目录/.search_index/index.json", en: "Index location: vault root/.search_index/index.json"},
    "settings.buildIndexName": {zh: "全量构建索引", en: "Full Rebuild"},
    "settings.buildIndexDesc": {zh: "遍历所有笔记重新生成向量索引（首次使用或模型变更后执行）", en: "Rebuild the entire index from scratch (use after first setup or model changes)"},
    "settings.buildIndexBtn": {zh: "Build Index", en: "Build Index"},
    "settings.buildIndexBuilding": {zh: "构建中...", en: "Building..."},
    "settings.buildIndexDone": {zh: "完成", en: "Done"},
    "settings.incrIndexName": {zh: "增量更新索引", en: "Incremental Update"},
    "settings.incrIndexDesc": {zh: "只更新有变更的笔记，速度更快", en: "Only re-index changed notes (faster)"},
    "settings.incrIndexBtn": {zh: "Update Index", en: "Update Index"},
    "settings.incrIndexUpdating": {zh: "更新中...", en: "Updating..."},
    "settings.incrIndexRebuildWarning": {zh: "检测到配置变更：%s\n\n由于 Embedding 配置已变更，旧向量与新向量空间不兼容，增量更新将强制执行全量重建（会消耗较多 token）。\n\n确认继续？", en: "Config changed: %s\n\nEmbedding config has changed; the old vectors are incompatible. Incremental update will force a full rebuild (may consume many tokens).\n\nProceed?"},
    "settings.confirmRebuild": {zh: "确认全量重建", en: "Confirm Full Rebuild"},
    "settings.cancel": {zh: "取消", en: "Cancel"},
    "settings.fullRebuildBuilding": {zh: "全量重建中...", en: "Rebuilding..."},
    "settings.progress": {zh: "进度：%d / %d", en: "Progress: %d / %d"},
    "settings.testSingleName": {zh: "测试：仅索引当前笔记", en: "Test: Index active note"},
    "settings.testSingleDesc": {zh: "仅对当前打开的笔记生成索引，用于功能验证，消耗极少 token", en: "Index only the currently open note for testing. Minimal token usage."},
    "settings.testSingleBtn": {zh: "索引当前笔记", en: "Index active note"},

    "pipeline.systemPrompt": {zh: "你是知识库助手。你的唯一信息来源是用户提供的笔记内容，禁止使用任何外部知识或自行推断补充。回答时严格引用笔记原文，用 [序号] 标注来源。如果提供的笔记中没有足够信息回答问题，必须明确回复：知识库中未检索到相关内容，不得编造或推测。", en: "You are a knowledge base assistant. Your only information source is the provided note content. Do not use external knowledge or make inferences beyond the notes. When answering, strictly cite the notes using [number] markers. If the notes don't contain enough information, clearly state: 'No relevant content found in the knowledge base.' Do not fabricate or speculate."},
};

export function t(key: string): string {
    const locale = detectLocale();
    const entry = strings[key];
    if (!entry) return key;
    return entry[locale];
}

export function tFormat(key: string, ...args: (string | number)[]): string {
    let result = t(key);
    for (const arg of args) {
        result = result.replace(/%[ds]/, String(arg));
    }
    return result;
}
