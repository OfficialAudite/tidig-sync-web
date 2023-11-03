<script>
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    export let form;

    function downloadCSV(csvContent, fileName) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    $: if (form?.success) {
        downloadCSV(form?.data, 'tt-data.csv');
        setTimeout(() => goto('/'), 2500);
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' || e.key === 'Escape') {
            form.message = '';
        }
    }

    let today = new Date().toISOString().slice(0, 10);
</script>

<div class="flex flex-col justify-center items-center h-screen">
    <img src="./logo.png" class="w-36" alt="">
    {#if form?.message}
        <div class={form.success ? 'alert success' : 'alert error'} on:click={() => form.message = ''} on:keydown={handleKeyDown} tabindex="0" role="button" aria-label="Close alert">
            <p>{form.message}</p>
        </div>
    {/if}
    <form method="post" use:enhance action="?/login" class="w-full max-w-xs">
        <div class="mb-4">
            <label for="email" class="block text-gray-200 text-sm font-bold mb-2">
                Email:
            </label>
            <input type="email" id="email" name="email" required autocomplete="email" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline">
        </div>
        <div class="mb-4">
            <label for="password" class="block text-gray-200 text-sm font-bold mb-2">
                Password:
            </label>
            <input type="password" id="password" name="password" required autocomplete="current-password" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 mb-3 leading-tight focus:outline-none focus:shadow-outline">
        </div>
        <div class="mb-4">
            <label for="dateFrom" class="block text-gray-200 text-sm font-bold mb-2">
                Date From:
            </label>
            <input type="date" id="dateFrom" name="dateFrom" required value={today} class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline">
        </div>
        <div class="mb-6">
            <label for="dateTo" class="block text-gray-200 text-sm font-bold mb-2">
                Date To:
            </label>
            <input type="date" id="dateTo" name="dateTo" required value={today} class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline">
        </div>
        <div class="flex items-center justify-between">
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded focus:outline-none focus:shadow-outline mx-auto">
                Submit
            </button>
        </div>
        <p class="text-white text-[10px] my-4">This tool is not affiliated with Toggl or Tidig or Consid and has been created for convenience. Please ensure you have the right to export and manipulate the data as this tool facilitates.</p>
        <p class="text-white text-[10px] my-4 text-center">Made by <a href="https://github.com/OfficialAudite/" class=" text-blue-500 hover:text-blue-300 hover:underline">@officialaudite</a></p>
    </form>
</div>
